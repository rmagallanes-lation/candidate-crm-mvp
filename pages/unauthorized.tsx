import Link from "next/link";
import { useRouter } from "next/router";

export default function UnauthorizedPage() {
  const { query } = useRouter();
  const message =
    typeof query.reason === "string"
      ? decodeURIComponent(query.reason)
      : "You are not allowed to access this resource.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6 text-center">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white px-10 py-12 shadow-lg shadow-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-500">
          ⚠️
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Access restricted</h1>
        <p className="mt-4 text-sm text-slate-500">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/api/auth/logout"
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
          >
            Sign in with a different account
          </Link>
          <Link
            href="/"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
