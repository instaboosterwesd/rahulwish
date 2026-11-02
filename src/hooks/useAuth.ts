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
    let currentUser: User | null = null;
    let requestId = 0;
    const refreshRole = async () => {
      const id = ++requestId;
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const result = await myRole();
        if (active && id === requestId) setIsAdmin(result.role === "admin");
      } catch {
        if (active && id === requestId) setIsAdmin(false);
      } finally {
        if (active && id === requestId) setLoading(false);
      }
    };
    const onFocus = () => { void refreshRole(); };
    const onVisibility = () => { if (document.visibilityState === "visible") void refreshRole(); };
    const interval = window.setInterval(() => {
      if (currentUser && document.visibilityState === "visible") void refreshRole();
    }, 10_000);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    watchFirebaseUser(async (u) => {
      if (!active) return;
      currentUser = u;
      setUser(u);
      setIsAdmin(false);
      await refreshRole();
    })
      .then((off) => { if (active) unsubscribe = off; else off(); })
      .catch(() => { if (active) { setUser(null); setLoading(false); } });
    return () => {
      active = false;
      requestId++;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}
