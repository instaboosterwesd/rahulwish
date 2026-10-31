export const USER_ID_RE = /^[a-z0-9_]{4,20}$/;

export function cleanUserId(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

export function suggestUserId(name: string) {
  const base = cleanUserId(name.trim().split(/\s+/)[0] || "user").slice(0, 14) || "user";
  return `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Internal sign-in address derived from the user ID (never shown to users). */
export function userIdEmail(id: string) {
  return `${cleanUserId(id)}@user.rgx4you.app`;
}
