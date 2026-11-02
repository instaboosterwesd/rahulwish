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
export type AppUserProfile = {
  name: string;
  email: string;
  photo: string | null;
  provider: "password" | "google.com";
  createdAt: number;
  lastLoginAt: number;
};

// Builds the Realtime Database record for users/{uid}. New email accounts are saved
// straight away (no verification email); the first sign-up time is kept on later logins.
export function buildUserProfile(
  user: { email: string | null; displayName: string | null; photoURL: string | null },
  provider: AppUserProfile["provider"],
  existing: Partial<AppUserProfile> | null,
  now: number,
  typedName?: string,
): AppUserProfile {
  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) throw new Error("This account has no email address");
  const name = (typedName?.trim() || user.displayName?.trim() || existing?.name || email.split("@")[0] || "User").slice(0, 80);
  const photo = user.photoURL && user.photoURL.startsWith("https://") ? user.photoURL.slice(0, 500) : null;
  const createdAt = typeof existing?.createdAt === "number" ? existing.createdAt : now;
  return { name, email, photo, provider, createdAt, lastLoginAt: now };
}

// Cleans a name typed on the profile page: trimmed, inner spaces collapsed, 1–80 characters
// (the same limit the database rules enforce for users/{uid}/name).
export function cleanDisplayName(input: string): string {
  const name = input.replace(/\s+/g, " ").trim();
  if (!name) throw new Error("Please enter your name.");
  if (name.length > 80) throw new Error("Name must be 80 characters or fewer.");
  return name;
}
