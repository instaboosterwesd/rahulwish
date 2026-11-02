import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronRight, KeyRound, LogOut, Pencil, Share2, Shield, X } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ClayIcon, type ClayIconName } from "@/components/ClayIcon";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { firebasePasswordReset, firebaseSignOut, readUserProfile, updateDisplayName } from "@/lib/firebase-browser";
import type { AppUserProfile } from "@/lib/firebase-access";
import { customerQuery } from "@/lib/customer.functions";
import { formatMoneyINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — RGX4YOU" }, { name: "description", content: "Your RGX4YOU account, orders and wallet at a glance." }, { property: "og:title", content: "Profile — RGX4YOU" }, { property: "og:description", content: "Your RGX4YOU account, orders and wallet at a glance." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

const dateFmt = (ms?: number) => (ms ? new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "U";

function Page() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Partial<AppUserProfile> | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const dashboard = useQuery({ ...customerQuery(), enabled: !!user, retry: false });
  useEffect(() => {
    if (!user) return;
    readUserProfile(user.uid).then(setProfile).catch(() => setProfile(null));
  }, [user]);
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const displayName = profile?.name || user?.displayName || "RGX4YOU user";
  const displayEmail = profile?.email || user?.email || "";
  const provider = profile?.provider ?? (user?.providerData[0]?.providerId === "google.com" ? "google.com" : "password");
  const photo = profile?.photo || user?.photoURL || null;
  const surprises = dashboard.data?.surprises ?? [];
  const stats: { icon: ClayIconName; label: string; value: string; to: "/orders" | "/wallet" }[] = [
    { icon: "orders", label: "Surprises", value: dashboard.data ? String(surprises.length) : "—", to: "/orders" },
    { icon: "share", label: "Total views", value: dashboard.data ? String(surprises.reduce((n, s) => n + s.views, 0)) : "—", to: "/orders" },
    { icon: "wallet", label: "Wallet", value: dashboard.data ? formatMoneyINR(dashboard.data.balance) : "—", to: "/wallet" },
  ];
  const rows: { to: "/templates" | "/orders" | "/wallet"; label: string; hint: string; icon: ClayIconName }[] = [
    { to: "/templates", label: "Browse templates", hint: "Find your next surprise", icon: "templates" },
    { to: "/orders", label: "My orders", hint: "Edit and share your surprises", icon: "orders" },
    { to: "/wallet", label: "Wallet", hint: "Balance and payments", icon: "wallet" },
  ];

  async function saveName() {
    setSaving(true);
    try {
      const name = await updateDisplayName(draft);
      setProfile((p) => ({ ...(p ?? {}), name }));
      setEditing(false);
      toast.success("Name updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your name");
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (!displayEmail) return;
    try {
      await firebasePasswordReset(displayEmail);
      toast.success(`Password reset link sent to ${displayEmail}`);
    } catch {
      toast.error("Could not send the reset link. Please try again later.");
    }
  }

  async function shareSite() {
    const url = window.location.origin;
    const data = { title: "RGX4YOU", text: "Make a surprise website for someone special 💖", url };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch { /* closed share sheet */ }
  }

  return (
    <div className="min-h-[100dvh] bg-night">
      <SiteHeader />
      <main className="space-y-5 px-4 pt-24">
        <section className="rounded-3xl glass p-5">
          <div className="flex items-center gap-4">
            {photo
              ? <img src={photo} alt="" referrerPolicy="no-referrer" className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/40" />
              : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-rose-gradient text-xl font-semibold text-primary-foreground">{initials(displayName)}</div>}
            <div className="min-w-0 flex-1">
              {editing ? (
                <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); void saveName(); }}>
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={80} aria-label="Your name"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-3 py-1.5 text-base outline-none focus:border-primary" />
                  <button type="submit" disabled={saving} aria-label="Save name" className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-2xl">{displayName}</h1>
                  <button type="button" onClick={() => { setDraft(displayName); setEditing(true); }} aria-label="Edit name" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                </div>
              )}
              <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
              {isAdmin && <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary"><Shield className="h-3 w-3" /> Admin</span>}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <Link key={s.label} to={s.to} className="rounded-3xl glass p-3 text-center">
              <ClayIcon name={s.icon} className="mx-auto h-8 w-8" />
              <p className="mt-1 truncate text-lg font-semibold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </section>
        {dashboard.isError && <p className="-mt-2 text-center text-xs text-muted-foreground">Order and wallet numbers couldn't load right now.</p>}

        {surprises.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent surprises</h2>
              <Link to="/orders" className="text-sm text-primary">See all</Link>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {surprises.slice(0, 5).map((s) => (
                <Link key={s.id} to="/customize/$id" params={{ id: s.id }} className="w-32 shrink-0 overflow-hidden rounded-2xl bg-card shadow-card">
                  {s.templates?.cover_image && <img src={s.templates.cover_image} alt="" loading="lazy" className="aspect-square w-full object-cover" />}
                  <div className="p-2">
                    <p className="truncate text-xs font-semibold">{s.templates?.title ?? "Surprise"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{s.recipient_name ? `For ${s.recipient_name}` : "Not sent yet"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <ul className="divide-y divide-border overflow-hidden rounded-3xl glass">
          {rows.map(({ to, label, hint, icon }) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-3 p-4">
                <ClayIcon name={icon} className="h-8 w-8 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{hint}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link to="/admin" className="flex items-center gap-3 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Shield className="h-4 w-4" /></span>
                <span className="flex-1 font-medium">Admin panel</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          )}
        </ul>

        <section className="rounded-3xl glass p-4">
          <h2 className="text-lg font-semibold">Account</h2>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Signed in with</dt><dd className="font-medium">{provider === "google.com" ? "Google" : "Email & password"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Member since</dt><dd className="font-medium">{dateFmt(profile?.createdAt)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Last sign-in</dt><dd className="font-medium">{dateFmt(profile?.lastLoginAt)}</dd></div>
          </dl>
          <div className="mt-4 grid gap-2">
            {provider === "password" && (
              <Button variant="glass" className="w-full" onClick={resetPassword}><KeyRound /> Change password</Button>
            )}
            <Button variant="glass" className="w-full" onClick={shareSite}><Share2 /> Share RGX4YOU with a friend</Button>
          </div>
        </section>

        <Button variant="outline" className="w-full" onClick={async () => { await firebaseSignOut().catch(() => undefined); queryClient.clear(); nav({ to: "/" }); }}>
          <LogOut /> Log out
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
