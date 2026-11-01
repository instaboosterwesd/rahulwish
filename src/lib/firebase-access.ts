export type FirebaseProfileAccess = { banned?: boolean; deleted_at?: string | null };

export function assertFirebaseAccount(profile: FirebaseProfileAccess | null) {
  if (!profile || profile.banned || profile.deleted_at) throw new Error("Account unavailable");
}

export function assertFirebaseAdmin(profile: FirebaseProfileAccess | null, role: unknown) {
  assertFirebaseAccount(profile);
  if (role !== "admin") throw new Error("Admin access required");
}

export function firebaseOwnedPath(uid: string, path: string) {
  return path.startsWith(`${uid}/`) && !path.includes("..") && !path.includes("\\");
}

export const firebaseTokenRequirements = (projectId: string) => ({
  issuer: `https://securetoken.google.com/${projectId}`,
  audience: projectId,
  algorithms: ["RS256"],
});
// Only a verified Google identity from Firebase may open an app account.
export function firebaseGoogleIdentity(claims: Record<string, unknown>) {
  const firebase = claims["firebase"] as { sign_in_provider?: unknown } | undefined;
  if (firebase?.sign_in_provider !== "google.com") throw new Error("Please sign in with Google");
  const email = typeof claims["email"] === "string" ? claims["email"].trim().toLowerCase() : "";
  if (!email || claims["email_verified"] !== true) throw new Error("Your Google email is not verified");
  const name = typeof claims["name"] === "string" ? claims["name"].slice(0, 80) : null;
  const picture = typeof claims["picture"] === "string" && claims["picture"].startsWith("https://") ? claims["picture"] : null;
  return { email, name, picture };
}
