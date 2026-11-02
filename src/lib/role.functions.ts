import { createServerFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/lib/firebase-auth";
import { normalizeRole } from "@/lib/roles";

// Returns the caller's role from users/{uid}/role and creates it as "user" the first time,
// so every account has a role the owner can switch to "admin" in Firebase.
export const myRole = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(async ({ context }) => {
  const { dbGet, dbSet } = await import("@/lib/firebase-db.server");
  const stored = await dbGet<unknown>(`users/${context.uid}/role`);
  if (stored === null) await dbSet(`users/${context.uid}/role`, "user");
  return { role: normalizeRole(stored) };
});
