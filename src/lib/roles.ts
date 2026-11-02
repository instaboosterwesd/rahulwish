export type AppRole = "admin" | "user";

// Only the exact value "admin" grants admin access; anything else (missing, typo) is a normal user.
export function normalizeRole(value: unknown): AppRole {
  return value === "admin" ? "admin" : "user";
}
