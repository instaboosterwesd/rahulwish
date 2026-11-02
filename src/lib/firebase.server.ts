import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";
import { firebaseConfig } from "./firebase-config";
import { firebaseTokenRequirements } from "./firebase-access";

const firebaseKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

export async function verifyFirebaseToken(token: string) {
  const { payload } = await jwtVerify(token, firebaseKeys, firebaseTokenRequirements(firebaseConfig.projectId));
  if (!payload.sub || payload.sub.length > 128 || typeof payload["auth_time"] !== "number") throw new Error("Invalid sign-in session");
  return { uid: payload.sub, email: typeof payload["email"] === "string" ? payload["email"] : null, claims: payload };
}

export async function firebaseServiceToken(credentialJson: string) {
  let credential: { project_id?: string; client_email?: string; private_key?: string };
  try { credential = JSON.parse(credentialJson); } catch { throw new Error("Firebase server credentials are invalid"); }
  if (credential.project_id !== firebaseConfig.projectId || !credential.client_email || !credential.private_key) throw new Error("Firebase server credentials must belong to rahul-wish");
  const key = await importPKCS8(credential.private_key, "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/cloud-platform" })
    .setProtectedHeader({ alg: "RS256" }).setIssuer(credential.client_email)
    .setAudience("https://oauth2.googleapis.com/token").setIssuedAt().setExpirationTime("1h").sign(key);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error("Firebase server authorization failed");
  const result = await response.json() as { access_token?: string };
  if (!result.access_token) throw new Error("Firebase server authorization failed");
  return result.access_token;
}

export async function firebaseRead<T>(path: string, accessToken: string): Promise<T | null> {
  if (!/^[a-zA-Z0-9_/-]+$/.test(path)) throw new Error("Invalid database path");
  const response = await fetch(`${firebaseConfig.databaseURL}/${path}.json`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Firebase database is unavailable or access is denied");
  return response.json() as Promise<T | null>;
}