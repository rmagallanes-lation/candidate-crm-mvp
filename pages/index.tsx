import { useEffect, useState } from "react";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"classic" | "modern" | "pro">("classic");

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
          {["classic", "modern", "pro"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                viewMode === mode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              {mode === "classic" ? "Classic" : mode === "modern" ? "Modern" : "Pro"}
            </button>
          ))}
        </div>
      </div>

      {/* Switch between 3 views */}
      {viewMode === "classic" && <ClassicTable candidates={candidates} />}
      {viewMode === "modern" && <ModernCards candidates={candidates} />}
      {viewMode === "pro" && <ProDashboard candidates={candidates} />}
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