import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Always4you" }, { name: "description", content: "Sign in to Always4you" }, { property: "og:title", content: "Sign in — Always4you" }, { property: "og:description", content: "Sign in to manage your Always4you surprises." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? error.message : "Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message); else nav({ to: "/" });
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl glass p-8">
        <h1 className="text-4xl">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Button type="submit" variant="hero" className="w-full">{mode === "in" ? "Sign in" : "Sign up"}</Button>
        <Button type="button" variant="glass" className="w-full" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>Continue with Google</Button>
        <button type="button" className="text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
        {msg && <p className="text-sm text-blush">{msg}</p>}
      </form>
    </div>
  );
}
