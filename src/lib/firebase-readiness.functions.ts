import { createServerFn } from "@tanstack/react-start";

// Safe readiness check only: no private data or credential values cross this RPC.
export const firebaseReadiness = createServerFn({ method: "GET" }).handler(async () => {
  const credentialJson = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!credentialJson) return { ready: false, reason: "Firebase server credentials are not configured." };
  try {
    const { firebaseServiceToken, firebaseRead } = await import("./firebase.server");
    const token = await firebaseServiceToken(credentialJson);
    const marker = await firebaseRead<{ schemaVersion?: number; rulesVerified?: boolean; dataImported?: boolean }>("migration/readiness", token);
    return {
      ready: false,
      reason: marker?.schemaVersion === 1 ? "Firebase is reachable. Permissions, data import and app cutover still require verification." : "Firebase is reachable. The migration has not been initialized.",
    };
  } catch {
    return { ready: false, reason: "Firebase server access could not be verified." };
  }
});