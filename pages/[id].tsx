import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getSession, withPageAuthRequired } from "../lib/auth0";
import { userHasAccess } from "../lib/authorization";

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/candidates/${id}`)
      .then((res) => res.json())
      .then(setCandidate)
      .catch(console.error);
  }, [id]);

  if (!candidate) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {candidate.name} {candidate.lastName}
      </h1>
      <p className="text-gray-600 mb-2">{candidate.preferredRole}</p>
      <p className="text-gray-500">{candidate.email}</p>
      <p className="text-gray-500 mb-6">{candidate.phone}</p>

      <h2 className="text-xl font-semibold mb-2">Skills</h2>
      <ul className="flex flex-wrap gap-2 mb-6">
        {candidate.skills.map((s: string) => (
          <span key={s} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {s}
          </span>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Notes</h2>
      <p className="text-gray-700">{candidate.notes || "No notes available."}</p>
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
