import { ReactNode } from "react";

type NavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

const sidebarItems: NavItem[] = [
  { label: "Dashboard", icon: "home" },
  { label: "Candidates", icon: "users", active: true },
  { label: "Jobs", icon: "briefcase" },
  { label: "Reports", icon: "chart" },
  { label: "Settings", icon: "cog" },
];

const QuickIcon = ({ shape }: { shape: NavItem["icon"] }) => {
  const iconMap: Record<NavItem["icon"], JSX.Element> = {
    home: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600">
        <path
          d="M3 11L12 4l9 7v9a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-4H10v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
          fill="currentColor"
        />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600">
        <path
          d="M7 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm10-1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-12 2h4a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Zm11.8 0A4.2 4.2 0 0 1 23 16v2h-6v-2a5.9 5.9 0 0 0-.2-1.6"
          fill="currentColor"
        />
      </svg>
    ),
    briefcase: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600">
        <path
          d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2h4a1 1 0 0 1 1 1v4h-8v1a1 1 0 0 1-2 0v-1H2V7a1 1 0 0 1 1-1h4Zm2 0v2h2V4Zm-9 9h8v1a1 1 0 0 0 2 0v-1h8v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z"
          fill="currentColor"
        />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600">
        <path
          d="M4 3a1 1 0 0 1 1 1v13h14a1 1 0 0 1 0 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1Zm15.5 2a1 1 0 0 1 .9 1.4l-3 7a1 1 0 0 1-1.7.3L12 10.4 9.6 14a1 1 0 0 1-1.6.1L5 11.3a1 1 0 1 1 1.4-1.5l2.1 1.9 2.6-3.7a1 1 0 0 1 1.6-.1l2.7 3 2.3-5.4A1 1 0 0 1 19.5 5Z"
          fill="currentColor"
        />
      </svg>
    ),
    cog: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-600">
        <path
          d="M12 8a4 4 0 1 1-4 4 4 4 0 0 1 4-4Zm0-7a1 1 0 0 1 1 .76l.38 1.52a7 7 0 0 1 1.55.9l1.5-.4a1 1 0 0 1 1 .27l2 2a1 1 0 0 1 .25 1l-.4 1.5a7 7 0 0 1 .9 1.55l1.52.38a1 1 0 0 1 .76 1v2.8a1 1 0 0 1-.76 1l-1.52.38a7 7 0 0 1-.9 1.55l.4 1.5a1 1 0 0 1-.25 1l-2 2a1 1 0 0 1-1 .25l-1.5-.4a7 7 0 0 1-1.55.9l-.38 1.52a1 1 0 0 1-1 .76h-2.8a1 1 0 0 1-1-.76l-.38-1.52a7 7 0 0 1-1.55-.9l-1.5.4a1 1 0 0 1-1-.25l-2-2a1 1 0 0 1-.25-1l.4-1.5a7 7 0 0 1-.9-1.55l-1.52-.38A1 1 0 0 1 1 14.8V12a1 1 0 0 1 .76-1l1.52-.38a7 7 0 0 1 .9-1.55l-.4-1.5a1 1 0 0 1 .25-1l2-2a1 1 0 0 1 1-.25l1.5.4a7 7 0 0 1 1.55-.9l.38-1.52A1 1 0 0 1 9.2 1Z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
      {iconMap[shape]}
    </span>
  );
};

const HeaderAction = ({ children }: { children: ReactNode }) => (
  <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-slate-300 hover:text-slate-900">
    {children}
  </button>
);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-[80px_1fr]">
        <aside className="flex flex-col items-center gap-6 border-r border-slate-200 bg-white py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white">
            ti
          </div>
          <nav className="flex flex-1 flex-col items-center gap-4 pt-4">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition",
                  item.active
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100",
                ].join(" ")}
                aria-label={item.label}
              >
                <QuickIcon shape={item.icon} />
              </button>
            ))}
          </nav>
          <button className="mt-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            ?
          </button>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Recruitment</p>
                <div className="mt-1 flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-900">All Candidates</h1>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    551
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HeaderAction>Import</HeaderAction>
                <HeaderAction>Refer Candidate</HeaderAction>
                <button className="h-12 w-12 rounded-full bg-indigo-600 text-xl font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">
                  +
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                    RM
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Roberto</p>
                    <p className="text-xs text-slate-500">Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
