type JwtPayload = Record<string, unknown>;

export type AuthUser = {
  displayName: string;
  email: string;
  token: string;
  userRole: number;
};

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return atob(padded);
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

function readClaim(payload: JwtPayload | null, keys: string[]) {
  if (!payload) return undefined;

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" || typeof value === "number" || Array.isArray(value)) {
      return value;
    }
  }

  return undefined;
}

function resolveRoleValue(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "admin") return 4;
    if (normalized === "customer") return 1;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function getUserRoleFromToken(token: string) {
  const payload = parseJwtPayload(token);
  const claim = readClaim(payload, [
    "userRole",
    "role",
    "roles",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
  ]);

  if (Array.isArray(claim)) {
    for (const role of claim) {
      const resolved = resolveRoleValue(role);
      if (typeof resolved === "number") {
        return resolved;
      }
    }
    return 1;
  }

  return resolveRoleValue(claim) ?? 1;
}

export function normalizeAuthUser(raw: Partial<AuthUser> & Record<string, unknown>): AuthUser {
  const token = typeof raw.token === "string" ? raw.token : "";
  const payload = parseJwtPayload(token);
  const firstName = readClaim(payload, ["firstName", "given_name"]);
  const lastName = readClaim(payload, ["lastName", "family_name"]);
  const displayNameFromPayload = readClaim(payload, ["displayName", "name", "full_name", "unique_name"]);
  const emailFromPayload = readClaim(payload, ["email", "preferred_username", "unique_name"]);

  const displayName =
    (typeof raw.displayName === "string" && raw.displayName.trim()) ||
    (typeof displayNameFromPayload === "string" && displayNameFromPayload.trim()) ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (typeof emailFromPayload === "string" && emailFromPayload.trim()) ||
    "مستخدم";

  const email =
    (typeof raw.email === "string" && raw.email.trim()) ||
    (typeof emailFromPayload === "string" && emailFromPayload.trim()) ||
    "";

  const userRole =
    typeof raw.userRole === "number"
      ? raw.userRole
      : Number(raw.userRole ?? getUserRoleFromToken(token));

  return {
    displayName,
    email,
    token,
    userRole: Number.isFinite(userRole) ? userRole : 1
  };
}