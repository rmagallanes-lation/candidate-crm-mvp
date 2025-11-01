import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function runMigration() {
  try {
    await client.connect();
    const db = client.db("PeopleDB");
    const collection = db.collection("Candidates");

    const result = await collection.updateMany(
      {},
      [
        {
          $set: {
            name: { $ifNull: ["$name", ""] },
            lastName: { $ifNull: ["$lastName", ""] },
            dateOfBirth: { $ifNull: ["$dateOfBirth", null] },
            email: { $ifNull: ["$email", null] },
            phone: { $ifNull: ["$phone", null] },
            location: { $ifNull: ["$location", null] },
            country: { $ifNull: ["$country", null] },
            available: { $ifNull: ["$available", true] },
            preferredRole: { $ifNull: ["$preferredRole", "QA Engineer"] },
            workPreference: {
              $cond: [
                { $in: ["$workPreference", ["Remote", "Hybrid", "On-site"]] },
                "$workPreference",
                "Remote"
              ]
            },
            skills: {
              $cond: [
                { $isArray: "$skills" },
                "$skills",
                []
              ]
            },
            status: {
              $cond: [
                { $in: ["$status", ["New", "In Review", "Interviewing", "Hired", "Rejected"]] },
                "$status",
                "New"
              ]
            },
            notes: { $ifNull: ["$notes", ""] },
            createdAt: {
              $cond: [{ $not: ["$createdAt"] }, new Date(), "$createdAt"]
            },
            updatedAt: new Date()
          }
        }
      ]
    );

    console.log(`✅ Migration complete. ${result.modifiedCount} documents updated.`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await client.close();
  }
}

runMigration();