import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Heart, Lock, Mail, User as UserIcon } from "lucide-react";
import {
  firebaseEmailRegister,
  firebaseEmailSignIn,
  firebaseGoogleSignIn,
  firebasePasswordReset,
} from "@/lib/firebase-browser";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ClayIcon, type ClayIconName } from "@/components/ClayIcon";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — RGX4YOU" }, { name: "description", content: "Sign in or create your RGX4YOU account with email or Google." }, { property: "og:title", content: "Sign in — RGX4YOU" }, { property: "og:description", content: "Sign in to manage your RGX4YOU surprises." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
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

const PERKS: { icon: ClayIconName; text: string }[] = [
  { icon: "create", text: "Create beautiful surprise pages in minutes" },
  { icon: "share", text: "Share them with a single private link" },
  { icon: "wallet", text: "Track your orders and wallet in one place" },
];

type Mode = "signin" | "register";

function emailError(e: unknown) {
  const code = (e as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password.";
    case "auth/email-already-in-use":
      return "This email already has an account. Please sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a minute and try again.";
    case "auth/operation-not-allowed":
      return "Email sign-in isn't switched on yet. Please use Google for now.";
    case "auth/network-request-failed":
      return "No internet connection. Please try again.";
    default:
      return e instanceof Error && e.message && !code ? e.message : "Something went wrong. Please try again.";
  }
}

function Page() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"" | "email" | "google">("");
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState("");

  const reset = () => { setMsg(""); setNote(""); };

  const finish = () => { window.location.href = "/templates"; };

  const onEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 6) {
      setMsg(password.length < 6 ? "Password must be at least 6 characters." : "Please enter your email.");
      return;
    }
    setBusy("email");
    try {
      if (mode === "register") await firebaseEmailRegister(cleanEmail, password, name.trim().slice(0, 80));
      else await firebaseEmailSignIn(cleanEmail, password);
      finish();
    } catch (err) {
      setMsg(emailError(err));
      setBusy("");
    }
  };

  const onForgot = async () => {
    reset();
    const cleanEmail = email.trim();
    if (!cleanEmail) { setMsg("Type your email above first, then tap “Forgot password?”."); return; }
    try {
      await firebasePasswordReset(cleanEmail);
      setNote(`If ${cleanEmail} has an account, a password reset link is on its way.`);
    } catch (err) {
      setMsg(emailError(err));
    }
  };

  const onGoogle = async () => {
    reset();
    setBusy("google");
    try {
      await firebaseGoogleSignIn();
      finish();
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") setMsg("");
      else if (code === "auth/popup-blocked") setMsg("Your browser blocked the Google window. Please allow pop-ups and try again.");
      else if (code === "auth/unauthorized-domain") setMsg("Google sign-in is not enabled for this website address yet.");
      else setMsg(emailError(e));
      setBusy("");
    }
  };

  const isRegister = mode === "register";

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden px-6 pb-24">
      {/* soft glowing backdrop that the glass card blurs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-gradient opacity-40 blur-3xl" />
        <div className="absolute top-80 -right-16 h-56 w-56 rounded-full bg-gold-gradient opacity-35 blur-3xl" />
        <div className="absolute bottom-10 -left-16 h-56 w-56 rounded-full bg-rose-gradient opacity-30 blur-3xl" />
        <Heart className="absolute right-8 top-32 h-6 w-6 fill-primary/20 text-primary/20" />
        <Heart className="absolute left-6 top-64 h-4 w-4 fill-primary/15 text-primary/15" />
      </div>

      <SiteHeader />

      <div className="relative flex flex-1 flex-col justify-center pt-24">
        <div className="text-center animate-rise">
          <ClayIcon name="email" className="mx-auto h-20 w-20 animate-wobble" />
          <h1 className="mt-4 font-display text-4xl leading-tight">
            {isRegister ? "Create your " : "Welcome to "}
            <span className="text-rose-gradient">{isRegister ? "account" : "RGX4YOU"}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {isRegister ? "Sign up with your email to start making surprises" : "Sign in to create and manage your surprises"}
          </p>
        </div>

        <div className="mt-7 space-y-5 rounded-3xl glass p-5 animate-rise">
          <div className="segmented" role="tablist" aria-label="Sign in or create account">
            <button type="button" role="tab" aria-selected={!isRegister} data-active={!isRegister} className="segmented-item" onClick={() => { setMode("signin"); reset(); }}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={isRegister} data-active={isRegister} className="segmented-item" onClick={() => { setMode("register"); reset(); }}>
              Create account
            </button>
          </div>

          <form onSubmit={onEmailSubmit} className="space-y-3" noValidate>
            {isRegister && (
              <label className="relative block">
                <span className="sr-only">Your name</span>
                <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <input className="glass-field" type="text" autoComplete="name" placeholder="Your name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            )}
            <label className="relative block">
              <span className="sr-only">Email</span>
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input className="glass-field" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="relative block">
              <span className="sr-only">Password</span>
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input className="glass-field" type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "Create a password (6+ characters)" : "Password"} minLength={6} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>

            {!isRegister && (
              <div className="text-right">
                <button type="button" onClick={onForgot} className="text-xs text-primary underline-offset-4 hover:underline">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={!!busy} className="clay-btn w-full bg-rose-gradient py-3.5 text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              {busy === "email" ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          {msg && <p role="alert" className="text-center text-sm text-destructive">{msg}</p>}
          {note && <p role="status" className="rounded-2xl bg-primary/10 px-4 py-3 text-center text-sm text-foreground/80">{note}</p>}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={!!busy}
            className="clay-btn flex w-full items-center justify-center gap-3 glass-strong py-3.5 text-base font-semibold disabled:opacity-60"
          >
            <GoogleMark />
            {busy === "google" ? "Opening Google…" : "Continue with Google"}
          </button>

          <ul className="space-y-2.5 pt-1">
            {PERKS.map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <ClayIcon name={icon} className="h-9 w-9 shrink-0" />
                <span className="text-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
