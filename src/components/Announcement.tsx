import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Megaphone, Wrench, X } from "lucide-react";
import { getPublicSettings } from "@/lib/templates.functions";
import { Button } from "@/components/ui/button";
import { shouldShowAnnouncement } from "@/lib/announcement";

const SEEN_KEY = "a4y-announcement-seen-at";

export function Announcement() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [eligible, setEligible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    getPublicSettings()
      .then((value) => {
        let seenAt = 0;
        try { seenAt = Number(localStorage.getItem(SEEN_KEY) ?? 0); } catch { /* Storage may be unavailable. */ }
        if (value["announcement"]?.trim() && !pathname.startsWith("/admin") && shouldShowAnnouncement(seenAt, Date.now())) {
          setEligible(true);
          try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch { /* Keep this visit usable. */ }
        }
        setSettings(value);
      })
      .catch(() => setSettings({}));
  }, []);

  if (!settings) return null;

  // Admin panel hamesha accessible rahe
  const isAdmin = pathname.startsWith("/admin");

  if (settings["maintenance_mode"] === "on" && !isAdmin && pathname !== "/auth") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night px-6 text-center">
        <div className="clay max-w-md p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-gradient text-primary-foreground shadow-glow">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">Thoda sa intezaar…</h1>
          <p className="mt-3 text-muted-foreground">
            Hum website ko aur bhi khoobsurat bana rahe hain. Jald hi wapas aa rahe hain — tab tak ke
            liye shukriya!
          </p>
        </div>
      </div>
    );
  }

  const message = settings["announcement"]?.trim();
  if (!message || dismissed || isAdmin || !eligible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/20 px-6 backdrop-blur-sm">
      <div className="clay relative max-w-md p-10 text-center animate-rise">
        <Button variant="ghost" size="icon"
          aria-label="Close announcement"
          onClick={() => {
            setDismissed(true);
          }}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-accent-foreground shadow-card">
          <Megaphone className="h-6 w-6" />
        </div>
        <p className="mt-5 text-lg font-semibold leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
