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
import { buildUserProfile } from "@/lib/firebase-access";
describe("Direct registration profile saved to the Realtime Database", () => {
  const fresh = { email: "Priya@Example.com", displayName: null, photoURL: null };
  it("saves a new email account immediately with the typed name and lowercase email", () => {
    expect(buildUserProfile(fresh, "password", null, 1000, "Priya")).toEqual({
      name: "Priya", email: "priya@example.com", photo: null, provider: "password", createdAt: 1000, lastLoginAt: 1000,
    });
  });
  it("keeps the original sign-up time when the user signs in again", () => {
    const again = buildUserProfile({ ...fresh, displayName: "Priya" }, "password", { createdAt: 1000, name: "Priya" }, 5000);
    expect(again.createdAt).toBe(1000);
    expect(again.lastLoginAt).toBe(5000);
  });
  it("uses the Google name and photo for Google accounts", () => {
    const g = buildUserProfile({ email: "rahul@gmail.com", displayName: "Rahul", photoURL: "https://lh3.googleusercontent.com/a" }, "google.com", null, 1);
    expect(g.name).toBe("Rahul");
    expect(g.photo).toBe("https://lh3.googleusercontent.com/a");
  });
  it("rejects an account without an email", () => {
    expect(() => buildUserProfile({ email: null, displayName: "X", photoURL: null }, "google.com", null, 1)).toThrow("no email");
  });
});

describe("cleanDisplayName", () => {
  it("trims and collapses spaces", async () => {
    const { cleanDisplayName } = await import("@/lib/firebase-access");
    expect(cleanDisplayName("  Priya   Sharma ")).toBe("Priya Sharma");
  });
  it("rejects an empty name", async () => {
    const { cleanDisplayName } = await import("@/lib/firebase-access");
    expect(() => cleanDisplayName("   ")).toThrow("Please enter your name.");
  });
  it("rejects names longer than 80 characters", async () => {
    const { cleanDisplayName } = await import("@/lib/firebase-access");
    expect(cleanDisplayName("a".repeat(80))).toHaveLength(80);
    expect(() => cleanDisplayName("a".repeat(81))).toThrow("80 characters");
  });
});
