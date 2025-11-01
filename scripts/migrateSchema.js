const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const loadEnv = () => {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf-8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return;
    }
    const [key, ...rest] = trimmed.split("=");
    let value = rest.join("=").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key] && key) {
      process.env[key] = value;
    }
  });
};

loadEnv();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function migrateSchema() {
  try {
    await client.connect();
    const db = client.db("PeopleDB");
    const collection = db.collection("Candidates");
    const candidates = await collection.find({}).toArray();

    const allowedPreferences = ["Remote", "Hybrid", "On-site"];

    const normalizeStatus = (raw) => {
      if (typeof raw !== "string" || !raw.trim()) return "New";
      return raw.trim();
    };

    const coalesceString = (candidate, paths, fallback = "") => {
      for (const pathKey of paths) {
        const value = pathKey.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), candidate);
        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }
      return fallback;
    };

    const coalesceNullableString = (candidate, paths) => {
      const value = coalesceString(candidate, paths, "");
      return value || null;
    };

    const coalesceDate = (candidate, paths) => {
      for (const pathKey of paths) {
        const value = pathKey.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), candidate);
        if (!value) continue;
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
      }
      return null;
    };

    const coalesceDateString = (candidate, paths) => {
      const date = coalesceDate(candidate, paths);
      if (!date) return null;
      return date.toISOString().split("T")[0];
    };

    const normalizeSkills = (value) => {
      if (Array.isArray(value)) return value.filter((skill) => typeof skill === "string" && skill.trim());
      if (typeof value === "string" && value.trim()) {
        return value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
      return [];
    };

    let modifiedCount = 0;

    for (const candidate of candidates) {
      const normalizedStatus = normalizeStatus(
        candidate.status ?? candidate.interview_status ?? candidate.pipelineStatus
      );

      const preferredWork = coalesceNullableString(candidate, [
        "workPreference",
        "work_preference",
        "work.preference",
      ]);

      const statusLog = Array.isArray(candidate.statusLog)
        ? candidate.statusLog
        : Array.isArray(candidate.status_log)
        ? candidate.status_log
        : [];

      const normalizedStatusLog = statusLog
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          return {
            status: normalizeStatus(entry.status ?? entry.state ?? ""),
            date: entry.date
              ? new Date(entry.date).toISOString().split("T")[0]
              : entry.updatedAt
              ? new Date(entry.updatedAt).toISOString().split("T")[0]
              : null,
            updatedBy: coalesceString(entry, ["updatedBy", "user", "by"], ""),
          };
        })
        .filter((entry) => entry && entry.status);

      const experience = Array.isArray(candidate.experience)
        ? candidate.experience
        : Array.isArray(candidate.jobs)
        ? candidate.jobs
        : [];

      const normalizedExperience = experience
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          return {
            role: coalesceString(item, ["role", "title"]),
            company: coalesceString(item, ["company", "employer"]),
            years: typeof item.years === "number" ? item.years : Number(item.years) || 0,
          };
        })
        .filter((item) => item && (item.role || item.company));

      const normalizedTags = normalizeSkills(candidate.tags ?? candidate.labels);

      const createdAt =
        coalesceDate(candidate, ["createdAt", "added", "added_on", "created_at"]) ?? new Date();
      const updatedAt =
        coalesceDate(candidate, ["updatedAt", "updated_at", "lastUpdated"]) ?? new Date();

      const orderedDoc = {
        _id: candidate._id,
        name: coalesceString(candidate, ["name"]),
        lastName: coalesceString(candidate, ["lastName", "Last_name", "last_name"]),
        dateOfBirth: coalesceDateString(candidate, ["dateOfBirth", "dob"]),
        email: coalesceNullableString(candidate, ["email", "contact.email"]),
        phone: coalesceNullableString(candidate, ["phone", "contact.phone"]),
        linkedin: coalesceNullableString(candidate, ["linkedin", "contact.linkedin"]),
        portfolio: coalesceNullableString(candidate, ["portfolio", "contact.portfolio", "website"]),
        location: coalesceNullableString(candidate, ["location", "contact.location"]),
        country: coalesceNullableString(candidate, ["country"]),
        available: typeof candidate.available === "boolean" ? candidate.available : true,
        preferredRole: coalesceNullableString(candidate, ["preferredRole", "preferred_role"]),
        workPreference: allowedPreferences.includes(preferredWork || "") ? preferredWork : "Remote",
        expectedSalary: coalesceNullableString(candidate, ["expectedSalary", "expected_salary"]),
        skills: normalizeSkills(candidate.skills),
        tags: normalizedTags,
        status: normalizedStatus,
        statusLog: normalizedStatusLog,
        notes: coalesceString(candidate, ["notes", "contact.notes"]),
        source: coalesceNullableString(candidate, ["source"]),
        referredBy: coalesceNullableString(candidate, ["referredBy", "referred_by"]),
        addedBy: coalesceNullableString(candidate, ["addedBy", "added_by", "addedByName"]),
        experience: normalizedExperience,
        summary: coalesceNullableString(candidate, ["summary", "bio", "description"]),
        embedding: Array.isArray(candidate.embedding) ? candidate.embedding : [],
        matchScores: Array.isArray(candidate.matchScores) ? candidate.matchScores : [],
        createdAt,
        updatedAt,
      };

      const result = await collection.replaceOne({ _id: candidate._id }, orderedDoc, {
        upsert: false,
      });
      modifiedCount += result.modifiedCount;
    }

    console.log(`✅ Schema migration completed. Updated ${modifiedCount} documents.`);
  } finally {
    await client.close();
  }
}

migrateSchema().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
