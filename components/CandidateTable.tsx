import { Fragment } from "react";

type StatusLogEntry = {
  status?: string;
  date?: string;
  updatedBy?: string;
};

type ExperienceEntry = {
  role?: string;
  company?: string;
  years?: number;
};

export type Candidate = {
  _id: string;
  name: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  country: string | null;
  preferredRole: string | null;
  workPreference: string | null;
  expectedSalary?: string | null;
   available?: boolean;
  skills: string[];
  tags: string[];
  status: string | null;
  statusLog?: StatusLogEntry[];
  matchScores?: Array<number | { score?: number }>;
  summary?: string | null;
  experience?: ExperienceEntry[];
};

const pipelineStages = ["New", "In Review", "Interviewing", "Offer", "Hired"];
const palette = [
  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-purple-100 text-purple-700",
];

const statusColors: Record<string, string> = {
  New: "bg-slate-100 text-slate-700",
  "New Lead": "bg-sky-100 text-sky-700",
  "In Review": "bg-blue-100 text-blue-700",
  Interviewing: "bg-indigo-100 text-indigo-700",
  Offer: "bg-amber-100 text-amber-700",
  Hired: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

const normalizeStatus = (status?: string | null) => {
  if (!status) return "New";
  return status;
};

const getInitials = (first?: string, last?: string) => {
  const f = first?.trim();
  const l = last?.trim();
  if (!f && !l) return "??";
  const initials = [f?.[0], l?.[0]].filter(Boolean).join("");
  return initials.toUpperCase();
};

const getAvatarPalette = (seed: string) => {
  if (!seed) return palette[0];
  const code = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[code % palette.length];
};

const averageScore = (matchScores?: Array<number | { score?: number }>): number | null => {
  if (!Array.isArray(matchScores) || matchScores.length === 0) {
    return null;
  }

  const values = matchScores
    .map((entry) => {
      if (typeof entry === "number") return entry;
      if (entry && typeof entry === "object" && typeof entry.score !== "undefined") {
        return Number(entry.score);
      }
      return null;
    })
    .filter((value): value is number => typeof value === "number" && !Number.isNaN(value));

  if (values.length === 0) return null;
  const total = values.reduce((acc, value) => acc + value, 0);
  const avg = total / values.length;
  return Math.round(avg * 10) / 10;
};

const renderStars = (score: number, seed: string) => {
  const stars = [];
  const rounded = Math.round(score * 2) / 2;
  const safeSeed = seed.replace(/[^a-zA-Z0-9]/g, "");
  for (let i = 1; i <= 5; i += 1) {
    const diff = rounded - i;
    let fill = "fill-slate-200 text-slate-200";
    if (diff >= 0) fill = "fill-amber-400 text-amber-400";
    else if (diff === -0.5) fill = "fill-amber-400 text-slate-200";
    stars.push(
      <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${fill}`}>
        <defs>
          <linearGradient id={`${safeSeed}-half-${i}`} gradientTransform="rotate(0)">
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        <path
          d="m10 2.5 1.9 4.1 4.5.54-3.3 3.1.9 4.5-4-2.3-4 2.3.9-4.5-3.3-3.1 4.5-.54Z"
          fill={diff === -0.5 ? `url(#${safeSeed}-half-${i})` : "currentColor"}
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>
    );
  }
  return stars;
};

const StageMeter = ({ currentStage }: { currentStage: string }) => {
  const idx = pipelineStages.findIndex((stage) => stage === currentStage);
  return (
    <div className="flex items-center gap-1">
      {pipelineStages.map((stage, stageIndex) => (
        <span
          key={stage}
          className={[
            "h-1.5 w-8 rounded-full transition",
            stageIndex <= (idx === -1 ? 0 : idx) ? "bg-indigo-500" : "bg-slate-200",
          ].join(" ")}
        />
      ))}
    </div>
  );
};

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-500">
      📂
    </div>
    <h3 className="mt-6 text-lg font-semibold text-slate-900">No candidates yet</h3>
    <p className="mt-2 text-sm text-slate-500">
      Start building your talent pipeline by importing contacts or referring a candidate.
    </p>
    <div className="mt-6 flex justify-center gap-3">
      <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">
        Import candidates
      </button>
      <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900">
        Refer candidate
      </button>
    </div>
  </div>
);

const formatPhone = (phone: string | null) => {
  if (!phone) return "—";
  return phone;
};

const formatEmail = (email: string | null) => {
  if (!email) return "—";
  return email;
};

export default function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  if (!candidates || candidates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-100/60">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="w-[260px] px-6 py-5">Candidate Name</th>
            <th className="w-[200px] px-6 py-5">Role Applied</th>
            <th className="w-[200px] px-6 py-5">Stage</th>
            <th className="w-[180px] px-6 py-5">Score</th>
            <th className="w-[220px] px-6 py-5">Email</th>
            <th className="w-[160px] px-6 py-5">Phone</th>
            <th className="px-6 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {candidates.map((candidate) => {
            const status = normalizeStatus(candidate.status);
            const paletteClass = getAvatarPalette(candidate._id || candidate.email || candidate.name);
            const score = averageScore(candidate.matchScores) ?? 4.3;

            return (
              <tr key={candidate._id} className="transition hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${paletteClass}`}
                    >
                      {getInitials(candidate.name, candidate.lastName)}
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
                        {candidate.tags?.slice(0, 3).map((tag) => (
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
                      {candidate.preferredRole || "Not specified"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {candidate.workPreference ? `${candidate.workPreference} • ` : ""}
                      {candidate.expectedSalary || "Salary TBD"}
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
                    <StageMeter currentStage={status} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{score.toFixed(1)}</span>
                      <span className="text-xs text-amber-500">Great</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {renderStars(score, candidate._id)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <a
                      href={candidate.email ? `mailto:${candidate.email}` : "#"}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {formatEmail(candidate.email)}
                    </a>
                    <p className="text-xs text-slate-400">{candidate.summary ?? "No summary available"}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatPhone(candidate.phone)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-900">
                      View profile
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700">
                      <span className="text-xl leading-none">⋮</span>
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
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-slate-200 px-3 py-1 font-medium hover:border-slate-300 hover:text-slate-800">
            Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((page) => (
              <Fragment key={page}>
                <button
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                    page === 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {page}
                </button>
              </Fragment>
            ))}
          </div>
          <button className="rounded-full border border-slate-200 px-3 py-1 font-medium hover:border-slate-300 hover:text-slate-800">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
