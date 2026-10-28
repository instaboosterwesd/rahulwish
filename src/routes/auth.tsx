import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/phone-auth.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — RJX4You" }, { name: "description", content: "Mobile number aur code se RJX4You mein sign in karo." }, { property: "og:title", content: "Sign in — RJX4You" }, { property: "og:description", content: "Sign in to manage your RJX4You surprises." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const send = useServerFn(sendPhoneOtp);
  const verify = useServerFn(verifyPhoneOtp);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault(); setBusy(true); setMsg("");
    try { const r = await send({ data: { phone } }); setDeviceId(r.deviceId); setOtp(""); setMsg(`Code ${phone} par bhej diya ✅`); }
    catch (err) { setMsg(err instanceof Error ? err.message : "Code nahi bhej paaye"); }
    finally { setBusy(false); }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const r = await verify({ data: { phone, otp, deviceId } });
      const { error } = await supabase.auth.verifyOtp({ token_hash: r.tokenHash, type: "magiclink" });
      if (error) throw error;
      nav({ to: "/" });
    } catch (err) { setMsg(err instanceof Error ? err.message : "Code galat hai"); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-4">
      <form onSubmit={deviceId ? verifyCode : sendCode} className="w-full max-w-sm space-y-4 rounded-3xl glass p-8">
        <h1 className="text-4xl">{deviceId ? "Code daalo" : "Sign in"}</h1>
        <p className="text-sm text-muted-foreground">{deviceId ? "SMS mein aaya 4-digit code likho." : "Apna mobile number daalo, hum code bhejenge."}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-md glass px-3 py-2 text-sm">+91</span>
          <Input inputMode="numeric" autoComplete="tel-national" placeholder="9876543210" value={phone} disabled={!!deviceId}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required pattern="[6-9][0-9]{9}" />
        </div>
        {deviceId && (
          <Input inputMode="numeric" autoComplete="one-time-code" placeholder="4-digit code" value={otp} autoFocus
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} required pattern="[0-9]{4}" />
        )}
        <Button type="submit" variant="hero" className="w-full" disabled={busy || (deviceId ? otp.length !== 4 : phone.length !== 10)}>
          {busy ? "Ruko…" : deviceId ? "Login karo" : "Send code"}
        </Button>
        {deviceId && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <button type="button" onClick={() => { setDeviceId(""); setMsg(""); }}>Number badlo</button>
            <button type="button" disabled={busy} onClick={() => sendCode()}>Code dobara bhejo</button>
          </div>
        )}
        {msg && <p role="status" className="text-sm text-blush">{msg}</p>}
      </form>
    </div>
  );
}
