import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { normalizeRole } from "./roles";

// Browser side: sends the signed-in Firebase user's ID token with every server call.
// Signed-out visitors (and server rendering) simply send no token.
export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  let token: string | undefined;
  if (typeof window !== "undefined") {
    try {
      const { currentFirebaseUser } = await import("./firebase-browser");
      const user = await currentFirebaseUser();
      token = user ? await user.getIdToken() : undefined;
    } catch {
      token = undefined;
    }
  }
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});

export const UID_PATTERN = /^[A-Za-z0-9]{1,128}$/;

// Server side: verifies the Firebase ID token and blocks banned or removed accounts.
export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const header = getRequestHeader("authorization") ?? "";
  if (!header.startsWith("Bearer ")) throw new Error("Please sign in again.");
  const { verifyFirebaseToken } = await import("./firebase.server");
  let identity: { uid: string; email: string | null };
  try {
    identity = await verifyFirebaseToken(header.slice(7));
  } catch {
    throw new Error("Please sign in again.");
  }
  if (!UID_PATTERN.test(identity.uid)) throw new Error("Please sign in again.");
  const { dbGet } = await import("./firebase-db.server");
  const account = await dbGet<{ banned?: boolean; deleted_at?: string | null }>(`accounts/${identity.uid}`);
  if (account?.banned || account?.deleted_at) throw new Error("Your account is unavailable. Contact the site owner.");
  return next({ context: { uid: identity.uid, email: identity.email } });
});

// Admin role lives at users/{uid}/role = "admin"; database rules stop users changing their own role.
export const requireFirebaseAdmin = createMiddleware({ type: "function" })
  .middleware([requireFirebaseAuth])
  .server(async ({ next, context }) => {
    const { dbGet } = await import("./firebase-db.server");
    const role = await dbGet<string>(`users/${context.uid}/role`);
    if (normalizeRole(role) !== "admin") throw new Error("Admin access required");
    return next();
  });
