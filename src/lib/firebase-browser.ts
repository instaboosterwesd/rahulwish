import type { User } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";
import { buildUserProfile, type AppUserProfile } from "./firebase-access";

// Only call from an event handler or effect, never while rendering on the server.
export async function getFirebaseServices() {
  if (typeof window === "undefined") throw new Error("Firebase browser services are unavailable on the server.");
  const [{ getApps, initializeApp }, { getAuth }, { getDatabase }, { getStorage }] = await Promise.all([
    import("firebase/app"), import("firebase/auth"), import("firebase/database"), import("firebase/storage"),
  ]);
  const app = getApps().find((item) => item.name === "rgx4you-firebase") ?? initializeApp(firebaseConfig, "rgx4you-firebase");
  return { app, auth: getAuth(app), database: getDatabase(app), storage: getStorage(app) };
}

// Saves (or refreshes) the signed-in user's record at users/{uid} in the Realtime Database.
async function saveUserProfile(user: User, provider: AppUserProfile["provider"], typedName?: string) {
  const { database } = await getFirebaseServices();
  const { ref, get, update } = await import("firebase/database");
  const node = ref(database, `users/${user.uid}`);
  let existing: Partial<AppUserProfile> | null = null;
  try { existing = (await get(node)).val(); } catch { existing = null; }
  const profile = buildUserProfile(user, provider, existing, Date.now(), typedName);
  // Merge, never overwrite: keeps the role the owner/admin set on this user.
  await update(node, profile);
  return profile;
}

export async function readUserProfile(uid: string): Promise<Partial<AppUserProfile> | null> {
  const { database } = await getFirebaseServices();
  const { ref, get } = await import("firebase/database");
  return (await get(ref(database, `users/${uid}`))).val();
}

export async function firebaseGoogleSignIn() {
  const { auth } = await getFirebaseServices();
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  await saveUserProfile(result.user, "google.com");
  return result.user;
}

// Creates the account and signs the visitor in straight away — no verification email.
export async function firebaseEmailRegister(email: string, password: string, name: string) {
  const { auth } = await getFirebaseServices();
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  await saveUserProfile(cred.user, "password", name);
  return cred.user;
}

export async function firebaseEmailSignIn(email: string, password: string) {
  const { auth } = await getFirebaseServices();
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await saveUserProfile(cred.user, "password").catch(() => undefined);
  return cred.user;
}

export async function firebaseSignOut() {
  const { auth } = await getFirebaseServices();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

export async function firebasePasswordReset(email: string) {
  const { auth } = await getFirebaseServices();
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(auth, email);
}

// Resolves once Firebase has restored any saved session.
export async function currentFirebaseUser() {
  const { auth } = await getFirebaseServices();
  await auth.authStateReady();
  return auth.currentUser;
}

export async function watchFirebaseUser(cb: (user: User | null) => void) {
  const { auth } = await getFirebaseServices();
  const { onAuthStateChanged } = await import("firebase/auth");
  return onAuthStateChanged(auth, cb);
}

// Updates the signed-in user's display name in Firebase Auth and users/{uid}/name.
export async function updateDisplayName(input: string) {
  const { cleanDisplayName } = await import("./firebase-access");
  const name = cleanDisplayName(input);
  const { auth, database } = await getFirebaseServices();
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in again.");
  const [{ updateProfile }, { ref, update }] = await Promise.all([import("firebase/auth"), import("firebase/database")]);
  await updateProfile(user, { displayName: name });
  await update(ref(database, `users/${user.uid}`), { name });
  return name;
}
