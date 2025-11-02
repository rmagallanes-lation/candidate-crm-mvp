const domainEnv =
  process.env.ALLOWED_EMAIL_DOMAINS || process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || "";
const roleEnv = process.env.AUTHORIZED_ROLES || process.env.NEXT_PUBLIC_AUTHORIZED_ROLES || "";
const namespace =
  process.env.AUTH0_ROLE_NAMESPACE || "https://lation.ai/claims";

const allowedDomains = domainEnv
  .split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

const allowedRoles = roleEnv
  .split(",")
  .map((role) => role.trim())
  .filter(Boolean);

export type AuthorizationResult =
  | { authorized: true; reason?: undefined }
  | { authorized: false; reason: string };

type Auth0Claims = {
  email?: string;
  [key: string]: unknown;
};

export function userHasAccess(user: Auth0Claims | undefined | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: "Missing user session" };
  }

  // Email domain gate
  if (allowedDomains.length) {
    const domain = user.email?.split("@").pop()?.toLowerCase();
    if (!domain || !allowedDomains.includes(domain)) {
      return {
        authorized: false,
        reason: "Your email is not an approved company domain.",
      };
    }
  }

  // Role gate (roles stored in custom namespace array)
  if (allowedRoles.length) {
    const rolesClaim = user[`${namespace}/roles`];
    const roles: string[] = Array.isArray(rolesClaim)
      ? rolesClaim.map(String)
      : typeof rolesClaim === "string"
      ? rolesClaim.split(",").map((role) => role.trim())
      : [];

    const hasRequiredRole = roles.some((role) => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      return {
        authorized: false,
        reason: "You do not have the required role.",
      };
    }
  }

  return { authorized: true };
}
