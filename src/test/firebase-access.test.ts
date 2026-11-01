import { describe, expect, it } from "vitest";
import { assertFirebaseAccount, assertFirebaseAdmin, firebaseOwnedPath, firebaseTokenRequirements } from "@/lib/firebase-access";
import { firebaseConfig } from "@/lib/firebase-config";

describe("Firebase migration security", () => {
  it("targets the user's rahul-wish project", () => {
    expect(firebaseConfig.projectId).toBe("rahul-wish");
    expect(firebaseConfig.databaseURL).toBe("https://rahul-wish-default-rtdb.firebaseio.com");
    expect(firebaseConfig.storageBucket).toBe("rahul-wish.firebasestorage.app");
  });
  it("rejects banned accounts", () => {
    expect(() => assertFirebaseAccount({ banned: true })).toThrow("Account unavailable");
    expect(() => assertFirebaseAccount({ banned: false })).not.toThrow();
  });
  it("rejects deleted accounts", () => {
    expect(() => assertFirebaseAccount({ deleted_at: "2026-11-01T00:00:00Z" })).toThrow();
  });
  it("rejects admin operations for ordinary users and missing profiles", () => {
    expect(() => assertFirebaseAdmin({}, "user")).toThrow("Admin access required");
    expect(() => assertFirebaseAdmin(null, "admin")).toThrow("Account unavailable");
    expect(() => assertFirebaseAdmin({}, "admin")).not.toThrow();
  });
  it("rejects cross-owner upload paths and traversal", () => {
    expect(firebaseOwnedPath("alice", "bob/photo.jpg")).toBe(false);
    expect(firebaseOwnedPath("alice", "alice/../bob/photo.jpg")).toBe(false);
    expect(firebaseOwnedPath("alice", "alice/photo.jpg")).toBe(true);
  });
  it("requires Firebase tokens issued for the correct project", () => {
    expect(firebaseTokenRequirements("rahul-wish")).toEqual({
      issuer: "https://securetoken.google.com/rahul-wish", audience: "rahul-wish", algorithms: ["RS256"],
    });
  });
});
import { firebaseGoogleIdentity } from "@/lib/firebase-access";
describe("Firebase Google sign-in", () => {
  const google = { firebase: { sign_in_provider: "google.com" }, email: "Rahul@Gmail.com", email_verified: true, name: "Rahul" };
  it("accepts a verified Google account and normalises the email", () => {
    expect(firebaseGoogleIdentity(google)).toEqual({ email: "rahul@gmail.com", name: "Rahul", picture: null });
  });
  it("rejects sign-ins that did not come from Google", () => {
    expect(() => firebaseGoogleIdentity({ ...google, firebase: { sign_in_provider: "password" } })).toThrow("Please sign in with Google");
  });
  it("rejects unverified Google emails", () => {
    expect(() => firebaseGoogleIdentity({ ...google, email_verified: false })).toThrow("not verified");
  });
});
