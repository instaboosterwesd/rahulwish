import { firebaseConfig } from "./firebase-config";

// Only call from an event handler or effect, never while rendering on the server.
export async function getFirebaseServices() {
  if (typeof window === "undefined") throw new Error("Firebase browser services are unavailable on the server.");
  const [{ getApps, initializeApp }, { getAuth }, { getDatabase }, { getStorage }] = await Promise.all([
    import("firebase/app"), import("firebase/auth"), import("firebase/database"), import("firebase/storage"),
  ]);
  const app = getApps().find((item) => item.name === "rgx4you-firebase") ?? initializeApp(firebaseConfig, "rgx4you-firebase");
  return { app, auth: getAuth(app), database: getDatabase(app), storage: getStorage(app) };
}

export async function firebaseGoogleIdToken() {
  const { auth } = await getFirebaseServices();
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}

export async function firebaseSignOut() {
  const { auth } = await getFirebaseServices();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}
