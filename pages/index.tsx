// Dashboard Page
import { useEffect, useMemo, useState } from "react";
import CandidateTable, { Candidate as CandidateRecord } from "../components/CandidateTable";
import Layout from "../components/Layout";

type MetricTone = "indigo" | "emerald" | "amber" | "rose";

type ApiCandidate = CandidateRecord & {
  createdAt?: string;
  updatedAt?: string;
};

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-400">
    <path
      d="M9 2a7 7 0 1 1-4.9 11.9l-2 2A1 1 0 0 1 .7 14.5l2-2A7 7 0 0 1 9 2Zm0 2a5 5 0 1 0 3.5 8.5A5 5 0 0 0 9 4Z"
      fill="currentColor"
    />
  </svg>
);

const FilterChip = ({ label }: { label: string }) => (
  <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900">
    {label}
    <span className="text-slate-400">▾</span>
  </button>
);

const MetricCard = ({
  label,
  value,
  trend,
  tone = "indigo",
}: {
  label: string;
  value: string;
  trend: string;
  tone?: MetricTone;
}) => {
  const toneClasses: Record<MetricTone, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-100/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            toneClasses[tone]
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClasses[tone].split(" ")[0]} transition-all`} />
      </div>
    </article>
  );
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<ApiCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/candidates");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload: ApiCandidate[] = await response.json();
        if (isMounted) {
          setCandidates(payload);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = candidates.length;
    const interview = candidates.filter((candidate) =>
      (candidate.status ?? "").toLowerCase().includes("interview")
    ).length;
    const hired = candidates.filter((candidate) => (candidate.status ?? "").toLowerCase() === "hired").length;
    const available = candidates.filter((candidate) => candidate.available !== false).length;

    return {
      total,
      interview,
      hired,
      available,
    };
  }, [candidates]);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Total Candidates" value={String(metrics.total)} trend="+18% vs last month" />
          <MetricCard
            label="Interview Stage"
            value={String(metrics.interview)}
            trend={`${metrics.interview ? "+5%" : "0%"}`}
            tone="amber"
          />
          <MetricCard
            label="Hired This Quarter"
            value={String(metrics.hired)}
            trend={`${metrics.hired ? "+2" : "0"}`}
            tone="emerald"
          />
          <MetricCard
            label="Available Talent"
            value={String(metrics.available)}
            trend="62% ready"
            tone="indigo"
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm shadow-slate-100/60">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
              <SearchIcon />
              <input
                className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search candidate"
                type="search"
                disabled
              />
            </div>
            <FilterChip label="Date range" />
            <FilterChip label="Score range" />
            <FilterChip label="Role applied" />
            <FilterChip label="Jobs applied" />
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
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700 shadow-sm">
            Unable to load candidates. {error}
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm shadow-slate-100/60">
            <div className="flex flex-col gap-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : (
          <CandidateTable candidates={candidates} />
        )}
      </div>
    </Layout>
  );
}
