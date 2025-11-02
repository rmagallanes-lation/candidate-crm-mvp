import { useEffect, useState } from "react";
import { getSession, withPageAuthRequired } from "../lib/auth0";
import { userHasAccess } from "../lib/authorization";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"classic" | "modern" | "pro" | "premium">("classic");

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch("/api/candidates");
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading candidates...</div>;

  return (
    <div className="p-8">
      {/* Header + Switch */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Candidates</h1>

        {/* 🧩 3-Mode Switch */}
        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-full">
          {[
            ["classic", "Classic"],
            ["modern", "Modern"],
            ["pro", "Pro"],
            ["premium", "Premium"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                viewMode === (mode as typeof viewMode)
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Switch between 3 views */}
      {viewMode === "classic" && <ClassicTable candidates={candidates} />}
      {viewMode === "modern" && <ModernCards candidates={candidates} />}
      {viewMode === "pro" && <ProDashboard candidates={candidates} />}
      {viewMode === "premium" && <PremiumConsole candidates={candidates} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧱 Classic Table View */
/* -------------------------------------------------------------------------- */
function ClassicTable({ candidates }: { candidates: any[] }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left text-sm">
          <th className="p-3">Name</th>
          <th className="p-3">Role Applied</th>
          <th className="p-3">Status</th>
          <th className="p-3">Email</th>
          <th className="p-3">Phone</th>
          <th className="p-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((c) => (
          <tr key={c._id} className="border-b hover:bg-gray-50">
            <td className="p-3 font-medium">{c.name} {c.lastName}</td>
            <td className="p-3">{c.preferredRole ?? "—"}</td>
            <td className="p-3">
              <span className={`px-2 py-1 text-xs rounded ${
                c.status === "Hired"
                  ? "bg-green-100 text-green-700"
                  : c.status === "In Review"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {c.status}
              </span>
            </td>
            <td className="p-3">{c.email}</td>
            <td className="p-3">{c.phone}</td>
            <td className="p-3 text-right">
              <a href={`/candidates/${c._id}`} className="text-blue-500 hover:text-blue-700 text-sm">
                View Profile →
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* -------------------------------------------------------------------------- */
/* 💎 Modern Card View */
/* -------------------------------------------------------------------------- */
function ModernCards({ candidates }: { candidates: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {candidates.map((c) => (
        <div
          key={c._id}
          className="p-5 rounded-2xl shadow-sm bg-white border hover:shadow-md transition"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">
              {c.name} {c.lastName}
            </h2>
            <span className={`px-2 py-1 text-xs rounded ${
              c.status === "Hired"
                ? "bg-green-100 text-green-700"
                : c.status === "In Review"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {c.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{c.preferredRole ?? "—"}</p>
          <p className="text-sm text-gray-500">{c.email}</p>
          <p className="text-sm text-gray-500 mb-3">{c.phone}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {c.skills?.slice(0, 3).map((s: string) => (
              <span key={s} className="bg-blue-50 text-blue-600 px-2 py-0.5 text-xs rounded">
                {s}
              </span>
            ))}
          </div>
          <a
            href={`/candidates/${c._id}`}
            className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-3"
          >
            View Profile →
          </a>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ⚙️ Pro Dashboard View (Full CRM version) */
/* -------------------------------------------------------------------------- */
function ProDashboard({ candidates }: { candidates: any[] }) {
  return (
    <div className="bg-gray-50 rounded-2xl shadow-sm p-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Candidates" value={candidates.length} change="+18% vs last month" />
        <MetricCard title="Interview Stage" value="0" change="0%" />
        <MetricCard title="Hired This Quarter" value="0" change="+0%" />
        <MetricCard title="Available Talent" value="2" change="62% READY" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input placeholder="Search candidate..." className="border rounded px-3 py-2 text-sm" />
        <select className="border rounded px-3 py-2 text-sm">
          <option>Role</option>
          <option>QA Engineer</option>
          <option>Automation</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Filter</button>
      </div>

      {/* Candidate Table */}
      <ClassicTable candidates={candidates} />
    </div>
  );
}

function MetricCard({ title, value, change }: any) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-green-600 mt-1">{change}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🌟 Premium Console View (tiimi-inspired) */
/* -------------------------------------------------------------------------- */
const premiumPalette = [
  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-slate-100 text-slate-700",
  "bg-sky-100 text-sky-700",
];

const statusColors: Record<string, string> = {
  "New Lead": "bg-sky-100 text-sky-600",
  New: "bg-slate-100 text-slate-600",
  "In Review": "bg-blue-100 text-blue-600",
  Interviewing: "bg-indigo-100 text-indigo-600",
  Applying: "bg-amber-100 text-amber-600",
  Offer: "bg-purple-100 text-purple-600",
  Hired: "bg-emerald-100 text-emerald-600",
  Rejected: "bg-rose-100 text-rose-600",
};

const pipelineStages = ["Applying", "Screening", "Checking", "Interview", "Test"];

function avatarInitials(first: string, last: string) {
  const f = first?.trim()[0] ?? "";
  const l = last?.trim()[0] ?? "";
  const initials = (f + l).toUpperCase();
  return initials || "??";
}

function avatarColor(seed: string) {
  if (!seed) return premiumPalette[0];
  const idx = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return premiumPalette[idx % premiumPalette.length];
}

function averageScore(scores?: any[]) {
  if (!Array.isArray(scores) || scores.length === 0) return 4.3;
  const values = scores
    .map((entry) => {
      if (typeof entry === "number") return entry;
      if (entry && typeof entry === "object" && entry.score) return Number(entry.score);
      return null;
    })
    .filter((value) => typeof value === "number");
  if (values.length === 0) return 4.3;
  const total = values.reduce((acc, val) => acc + (val ?? 0), 0);
  return Math.round((total / values.length) * 10) / 10;
}

const starRange = [1, 2, 3, 4, 5];

function PremiumConsole({ candidates }: { candidates: any[] }) {
  const count = candidates.length;
  const interviewCount = candidates.filter((c) => /interview/i.test(c.status ?? "")).length;
  const hiredCount = candidates.filter((c) => /hired/i.test(c.status ?? "")).length;
  const averageOverallScore = averageScore(
    candidates.flatMap((candidate) => {
      if (Array.isArray(candidate.matchScores)) return candidate.matchScores;
      if (typeof candidate.score === "number") return [candidate.score];
      return [];
    })
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white p-6 shadow-lg shadow-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-slate-400">Recruitment</p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">All Candidates</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {count}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300">
            Import
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300">
            Refer Candidate
          </button>
          <button className="h-11 w-11 rounded-full bg-indigo-600 text-xl font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">
            +
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumMetric title="Total Candidates" value={count} delta="+18%" tone="indigo" />
        <PremiumMetric title="Interview Stage" value={interviewCount} delta="+5%" tone="amber" />
        <PremiumMetric title="Hired This Quarter" value={hiredCount} delta="+2" tone="emerald" />
        <PremiumMetric title="Average Score" value={averageOverallScore.toFixed(1)} delta="Great" tone="rose" />
      </div>

      {/* Filter row */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
          <span className="text-lg text-slate-400">🔍</span>
          <input
            type="search"
            placeholder="Search candidate"
            className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
            disabled
          />
        </div>
        {["Date Range", "Score Range", "Role Applied", "Jobs Applied"].map((label) => (
          <button
            key={label}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-slate-300"
          >
            {label}
            <span className="text-slate-400">▾</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300">
            Save view
          </button>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Export
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700">
            ☰
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-100">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-[260px] px-6 py-5">Candidate Name</th>
              <th className="w-[220px] px-6 py-5">Job Applied</th>
              <th className="w-[200px] px-6 py-5">Job Stage</th>
              <th className="w-[160px] px-6 py-5">Score</th>
              <th className="w-[220px] px-6 py-5">Email</th>
              <th className="w-[160px] px-6 py-5">Phone</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {candidates.map((candidate) => {
              const status = candidate.status ?? "New";
              const initials = avatarInitials(candidate.name ?? "", candidate.lastName ?? "");
              const palette = avatarColor(candidate._id ?? candidate.email ?? initials);
              const score = averageScore(candidate.matchScores);

              return (
                <tr key={candidate._id} className="transition hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${palette}`}>
                        {initials}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {[candidate.name, candidate.lastName].filter(Boolean).join(" ") || "Unnamed"}
                          </p>
                          {candidate.location && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {candidate.location}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                          {candidate.tags?.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                              {tag}
                            </span>
                          ))}
                          {candidate.tags && candidate.tags.length > 3 && (
                            <span className="text-slate-400">+{candidate.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-900">
                        {candidate.preferredRole ?? "Not specified"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {candidate.workPreference ?? "Work pref TBD"} •{" "}
                        {candidate.expectedSalary ?? "Salary TBD"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                      <div className="flex items-center gap-1">
                        {pipelineStages.map((stage, index) => (
                          <span
                            key={stage}
                            className={`h-1.5 w-8 rounded-full ${
                              index <= pipelineStages.indexOf(status ?? "")
                                ? "bg-indigo-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{score.toFixed(1)}</span>
                        <span className="text-xs text-amber-500">Great</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {starRange.map((star) => (
                          <svg
                            key={star}
                            viewBox="0 0 20 20"
                            className={`h-4 w-4 ${
                              star <= Math.round(score) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                            }`}
                          >
                            <path
                              d="m10 2.5 1.9 4.1 4.5.54-3.3 3.1.9 4.5-4-2.3-4 2.3.9-4.5-3.3-3.1 4.5-.54Z"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="0.5"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <a
                        href={candidate.email ? `mailto:${candidate.email}` : "#"}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        {candidate.email ?? "—"}
                      </a>
                      <p className="text-xs text-slate-400">
                        {candidate.summary ?? "No summary available"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{candidate.phone ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-900">
                        View profile
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500">
          <span>
            Showing <strong>{candidates.length}</strong> of <strong>{candidates.length}</strong> candidates
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-slate-200 px-3 py-1 font-medium hover:border-slate-300 hover:text-slate-800">
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    page === 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="rounded-full border border-slate-200 px-3 py-1 font-medium hover:border-slate-300 hover:text-slate-800">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = await getSession(ctx.req, ctx.res);
    const authz = userHasAccess(session?.user);
    if (!authz.authorized) {
      const reason = encodeURIComponent(authz.reason ?? "Unauthorized");
      return {
        redirect: {
          destination: `/unauthorized?reason=${reason}`,
          permanent: false,
        },
      };
    }

    return { props: {} };
  },
});

function PremiumMetric({
  title,
  value,
  delta,
  tone,
}: {
  title: string;
  value: number | string;
  delta: string;
  tone: "indigo" | "emerald" | "amber" | "rose";
}) {
  const toneClasses: Record<typeof tone, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-100/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneClasses[tone]}`}>
          {delta}
        </span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClasses[tone].split(" ")[0]} transition-all`} />
      </div>
    </article>
  );
}
