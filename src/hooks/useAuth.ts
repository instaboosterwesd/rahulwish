import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { watchFirebaseUser } from "@/lib/firebase-browser";
import { myRole } from "@/lib/role.functions";

// Accounts live in Firebase Authentication; the role comes from users/{uid}/role, checked on the server.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    watchFirebaseUser(async (u) => {
      if (!active) return;
      setUser(u);
      let admin = false;
      if (u) {
        try { admin = (await myRole()).role === "admin"; } catch { admin = false; }
      }
      if (!active) return;
      setIsAdmin(admin);
      setLoading(false);
    })
      .then((off) => { if (active) unsubscribe = off; else off(); })
      .catch(() => { if (active) { setUser(null); setLoading(false); } });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}
