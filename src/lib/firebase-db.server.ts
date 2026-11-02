import { firebaseConfig } from "./firebase-config";
import { firebaseServiceToken } from "./firebase.server";

// Server-only access to the Realtime Database and Firebase Authentication with the
// service account. It bypasses database rules, so every caller must check who is asking first.

let cached: { token: string; expiresAt: number } | null = null;

export async function adminToken() {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const credentialJson = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!credentialJson) throw new Error("Firebase server access is not set up yet.");
  const token = await firebaseServiceToken(credentialJson);
  cached = { token, expiresAt: Date.now() + 55 * 60_000 };
  return token;
}

const SAFE_PATH = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/;

function url(path: string) {
  if (path !== "" && !SAFE_PATH.test(path)) throw new Error("Invalid database path");
  return `${firebaseConfig.databaseURL}/${path}.json`;
}

async function request(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  const token = await adminToken();
  const init: RequestInit = { method, headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers } };
  if (body !== undefined) init.body = JSON.stringify(body);
  const response = await fetch(url(path), init);
  return response;
}

async function ensureOk(response: Response, action: string) {
  if (response.ok) return;
  console.error(`Firebase ${action} failed [${response.status}]: ${await response.text()}`);
  throw new Error("Could not reach the database. Please try again.");
}

export async function dbGet<T>(path: string): Promise<T | null> {
  const response = await request("GET", path);
  await ensureOk(response, `read ${path}`);
  return (await response.json()) as T | null;
}

export async function dbSet(path: string, value: unknown) {
  await ensureOk(await request("PUT", path, value), `write ${path}`);
}

// Multi-location update when path is "" (keys may contain slashes); otherwise a merge.
export async function dbUpdate(path: string, value: Record<string, unknown>) {
  await ensureOk(await request("PATCH", path, value), `update ${path || "root"}`);
}

export async function dbRemove(path: string) {
  await ensureOk(await request("DELETE", path), `remove ${path}`);
}

// Compare-and-set loop: `change` returns the new value, or undefined to abort.
export async function dbTransaction<T>(path: string, change: (current: T | null) => T | undefined, attempts = 8) {
  let response = await request("GET", path, undefined, { "X-Firebase-ETag": "true" });
  await ensureOk(response, `read ${path}`);
  let etag = response.headers.get("ETag") ?? "";
  let current = (await response.json()) as T | null;
  for (let i = 0; i < attempts; i++) {
    const next = change(current);
    if (next === undefined) return { committed: false as const, value: current };
    response = await request("PUT", path, next, { "if-match": etag });
    if (response.ok) return { committed: true as const, value: next };
    if (response.status !== 412) await ensureOk(response, `write ${path}`);
    etag = response.headers.get("ETag") ?? "";
    current = (await response.json()) as T | null;
  }
  throw new Error("The database is busy. Please try again.");
}

// ---- Firebase Authentication (admin) ----
const AUTH_BASE = `https://identitytoolkit.googleapis.com/v1/projects/${firebaseConfig.projectId}`;

export type AuthAccount = { localId: string; email?: string; displayName?: string; disabled?: boolean; createdAt?: string; providerUserInfo?: { providerId: string }[] };

export async function listAuthAccounts(): Promise<AuthAccount[]> {
  const token = await adminToken();
  const accounts: AuthAccount[] = [];
  let pageToken = "";
  for (let page = 0; page < 10; page++) {
    const query = new URLSearchParams({ maxResults: "500", ...(pageToken ? { nextPageToken: pageToken } : {}) });
    const response = await fetch(`${AUTH_BASE}/accounts:batchGet?${query}`, { headers: { Authorization: `Bearer ${token}` } });
    await ensureOk(response, "list accounts");
    const json = (await response.json()) as { users?: AuthAccount[]; nextPageToken?: string };
    accounts.push(...(json.users ?? []));
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return accounts;
}

export async function updateAuthAccount(uid: string, changes: { disableUser?: boolean; displayName?: string }) {
  const token = await adminToken();
  const response = await fetch(`${AUTH_BASE}/accounts:update`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ localId: uid, ...changes }),
  });
  await ensureOk(response, "update account");
}
