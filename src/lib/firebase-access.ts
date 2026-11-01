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