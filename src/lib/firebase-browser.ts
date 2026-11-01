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