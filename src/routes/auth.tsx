import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Sparkles, Link2, Wallet } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — RGX4YOU" }, { name: "description", content: "Sign in to RGX4YOU with your Google account." }, { property: "og:title", content: "Sign in — RGX4YOU" }, { property: "og:description", content: "Sign in to manage your RGX4YOU surprises." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

const PERKS = [
  { icon: Sparkles, text: "Create beautiful surprise pages in minutes" },
  { icon: Link2, text: "Share them with a single private link" },
  { icon: Wallet, text: "Track your orders and wallet in one place" },
];

function Page() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const signIn = async () => {
    setMsg("");
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setMsg("Could not start Google sign-in. Please try again.");
        setBusy(false);
        return;
      }
      if (result.redirected) return; // browser is leaving for Google
      window.location.href = "/templates";
    } catch {
      setMsg("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden px-6 pb-24">
      {/* soft glowing backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-gradient opacity-30 blur-3xl" />
        <div className="absolute bottom-10 -left-16 h-56 w-56 rounded-full bg-gold-gradient opacity-25 blur-3xl" />
        <Heart className="absolute right-8 top-32 h-6 w-6 fill-primary/20 text-primary/20" />
        <Heart className="absolute left-6 top-64 h-4 w-4 fill-primary/15 text-primary/15" />
        <Heart className="absolute bottom-40 right-10 h-5 w-5 fill-primary/10 text-primary/10" />
      </div>

      <SiteHeader />

      <div className="relative flex flex-1 flex-col justify-center pt-20">
        <div className="text-center animate-rise">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-gradient shadow-glow">
            <Heart className="h-10 w-10 fill-primary-foreground text-primary-foreground animate-heartbeat" />
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight">
            Welcome to <span className="text-rose-gradient">RGX4YOU</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
            Sign in to create and manage your surprises
          </p>
        </div>

        <div className="mt-8 space-y-5 rounded-3xl glass p-6 shadow-card animate-rise">
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-foreground/80">{text}</span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-border" />

          <button
            type="button"
            onClick={signIn}
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-background py-4 text-base font-semibold shadow-card transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            <GoogleMark />
            {busy ? "Opening Google…" : "Continue with Google"}
          </button>

          {msg && <p role="status" className="text-center text-sm text-destructive">{msg}</p>}

          <p className="text-center text-xs text-muted-foreground">
            New here? Your account is created automatically the first time you sign in.
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
