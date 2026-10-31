import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { cleanUserId, suggestUserId, userIdEmail, USER_ID_RE } from "@/lib/user-id";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — RGX4YOU" }, { name: "description", content: "Sign in or register on RGX4YOU with a user ID and password." }, { property: "og:title", content: "Sign in — RGX4YOU" }, { property: "og:description", content: "Sign in to manage your RGX4YOU surprises." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onName = (v: string) => {
    setName(v);
    if (!idTouched) setUserId(v.trim() ? suggestUserId(v) : "");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg("");
    const id = cleanUserId(userId);
    if (!USER_ID_RE.test(id)) return setMsg("User ID must be 4–20 letters, numbers or underscores.");
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");
    setBusy(true);
    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your name.");
        const { error } = await supabase.auth.signUp({
          email: userIdEmail(id), password,
          options: { data: { full_name: name.trim(), username: id } },
        });
        if (error) throw new Error(/registered|exists/i.test(error.message) ? "This user ID is taken. Try another." : error.message);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: userIdEmail(id), password });
        if (error) throw new Error("Wrong user ID or password.");
      }
      nav({ to: "/templates" });
    } catch (err) { setMsg(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  };

  const reg = mode === "register";
  return (
    <div className="flex min-h-[100dvh] flex-col px-6 pb-24">
      <SiteHeader />
      <div className="flex flex-1 flex-col justify-center pt-20">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 fill-primary text-primary animate-heartbeat" />
          <h1 className="mt-4 font-display text-4xl">{reg ? "Create account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{reg ? "Pick a user ID and password" : "Sign in with your user ID"}</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl glass p-6">
          {reg && (
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-semibold">Name</label>
              <Input id="name" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => onName(e.target.value)} />
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="uid" className="text-sm font-semibold">User ID</label>
            <div className="flex gap-2">
              <Input id="uid" autoComplete="username" placeholder="e.g. rahul_4821" value={userId}
                onChange={(e) => { setIdTouched(true); setUserId(cleanUserId(e.target.value)); }} />
              {reg && (
                <Button type="button" variant="outline" size="icon" aria-label="Suggest user ID"
                  onClick={() => { setIdTouched(false); setUserId(suggestUserId(name || "user")); }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {reg && <p className="text-xs text-muted-foreground">Made for you automatically — you can change it.</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="pw" className="text-sm font-semibold">Password</label>
            <Input id="pw" type="password" autoComplete={reg ? "new-password" : "current-password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : reg ? "Register" : "Sign in"}
          </Button>
          {msg && <p role="status" className="text-sm text-destructive">{msg}</p>}
          <p className="text-center text-sm text-muted-foreground">
            {reg ? "Already have an account? " : "New here? "}
            <button type="button" className="font-semibold text-primary underline" onClick={() => { setMode(reg ? "login" : "register"); setMsg(""); }}>
              {reg ? "Sign in" : "Register"}
            </button>
          </p>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
