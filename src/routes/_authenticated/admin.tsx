import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Ban,
  Pencil,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Clock,
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Users,
  Wallet,
  Wrench,
  XCircle,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  adminEditUser,
  adminDeleteUser,
  adminStatsQuery,
  adminSurprisesQuery,
  adminTemplatesQuery,
  adminUsersQuery,
  adminDepositsQuery,
  adminSettingsQuery,
  adminSetSurpriseStatus,
  adminToggleTemplate,
  adminSetTemplatePrice,
  adminSetUserBanned,
  adminSetDepositStatus,
  adminSetSetting,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Always4you" },
      { name: "description", content: "Manage templates, users, deposits and settings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Always4you" },
      { property: "og:description", content: "Manage templates, users, deposits and settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(adminStatsQuery()),
      context.queryClient.ensureQueryData(adminSurprisesQuery()),
      context.queryClient.ensureQueryData(adminTemplatesQuery()),
      context.queryClient.ensureQueryData(adminUsersQuery()),
      context.queryClient.ensureQueryData(adminDepositsQuery()),
      context.queryClient.ensureQueryData(adminSettingsQuery()),
    ]),
  component: AdminPage,
});

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "deposits", label: "Deposits", icon: Wallet },
  { id: "templates", label: "Templates", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Wrench },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const qc = useQueryClient();
  const editUser = useServerFn(adminEditUser);
  const deleteUser = useServerFn(adminDeleteUser);
  const editMut = useMutation({ mutationFn: (v: { id: string; full_name: string }) => editUser({ data: v }), onSuccess: () => { refresh(); setEditing(null); }, onError: (e) => toast.error(e.message) });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteUser({ data: { id } }), onSuccess: () => refresh(), onError: (e) => toast.error(e.message) });
  const setPrice = useServerFn(adminSetTemplatePrice);
  const priceMut = useMutation({
    mutationFn: (v: { id: string; price_inr: number; original_price_inr: number }) => setPrice({ data: v }),
    onSuccess: () => {
      refresh();
      setPriceEdit(null);
      toast.success("Price update ho gaya");
    },
    onError: (e) => toast.error(e.message),
  });
  const [priceEdit, setPriceEdit] = useState<{ id: string; price: string; original: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string; full_name: string } | null>(null);

  const { data: stats } = useSuspenseQuery(adminStatsQuery());
  const { data: surprises } = useSuspenseQuery(adminSurprisesQuery());
  const { data: templates } = useSuspenseQuery(adminTemplatesQuery());
  const { data: users } = useSuspenseQuery(adminUsersQuery());
  const { data: deposits } = useSuspenseQuery(adminDepositsQuery());
  const { data: settings } = useSuspenseQuery(adminSettingsQuery());

  const [tab, setTab] = useState<TabId>("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(settings["announcement"] ?? "");

  const refresh = () => {
    for (const k of ["admin-stats", "admin-surprises", "admin-templates", "admin-users", "admin-deposits", "admin-settings"])
      qc.invalidateQueries({ queryKey: [k] });
  };

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "paid" | "delivered" }) =>
      adminSetSurpriseStatus({ data: v }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const toggleMut = useMutation({
    mutationFn: (v: { id: string; field: "active" | "featured"; value: boolean }) =>
      adminToggleTemplate({ data: v }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const banMut = useMutation({
    mutationFn: (v: { id: string; banned: boolean }) => adminSetUserBanned({ data: v }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const depositMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "approved" | "rejected" }) =>
      adminSetDepositStatus({ data: v }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const settingMut = useMutation({
    mutationFn: (v: { key: string; value: string }) => adminSetSetting({ data: v }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });

  const visibleTabs = TABS.slice(0, 3);
  const moreTabs = TABS.slice(3);
  const activeInMore = moreTabs.some((t) => t.id === tab);

  const tabBtn = (t: (typeof TABS)[number]) => (
    <Button variant="ghost"
      key={t.id}
      onClick={() => {
        setTab(t.id);
        setMoreOpen(false);
      }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
        tab === t.id ? "bg-rose-gradient text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <t.icon className="h-4 w-4" /> {t.label}
    </Button>
  );

  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <p className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-blush">
          <LayoutDashboard className="h-3.5 w-3.5 text-gold" /> Admin Panel
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold">
          Command <span className="text-rose-gradient">Center</span>
        </h1>

        {/* Tab bar — desktop shows all, mobile shows first 3 + More */}
        <nav className="clay-sm mt-8 flex flex-wrap items-center gap-1 p-2">
          <span className="hidden md:contents">{TABS.map(tabBtn)}</span>
          <span className="contents md:hidden">
            {visibleTabs.map(tabBtn)}
            <span className="relative">
              <Button variant="ghost"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((o) => !o)}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold ${
                  activeInMore ? "bg-rose-gradient text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                More <ChevronDown className="h-4 w-4" />
              </Button>
              {moreOpen && (
                <div className="clay-sm absolute right-0 top-12 z-20 flex w-44 flex-col gap-1 p-2">
                  {moreTabs.map(tabBtn)}
                </div>
              )}
            </span>
          </span>
        </nav>

        {/* Dashboard */}
        {tab === "dashboard" && (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Templates", value: stats.templates },
                { label: "Surprises", value: stats.surprises },
                { label: "Paid orders", value: stats.paid },
                { label: "Users", value: stats.users },
                { label: "Pending deposits", value: stats.pendingDeposits },
              ].map((s) => (
                <div key={s.label} className="clay p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                  <p className="mt-2 font-display text-4xl font-semibold text-gold">{s.value}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-12 font-display text-3xl font-semibold">Recent Surprises</h2>
            <div className="clay mt-5 overflow-x-auto">
              {surprises.length === 0 ? (
                <p className="p-8 text-sm text-muted-foreground">
                  Abhi koi surprise nahi bana — pehla surprise aate hi yahan dikhega.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4">Code</th>
                      <th className="px-5 py-4">To / From</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surprises.map((s) => (
                      <tr key={s.id} className="border-b border-border/50 last:border-0">
                        <td className="px-5 py-4 font-mono text-gold">{s.code}</td>
                        <td className="px-5 py-4">
                          {s.recipient_name} <span className="text-muted-foreground">← {s.sender_name}</span>
                        </td>
                        <td className="px-5 py-4">{formatINR(s.amount_inr)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              s.status === "paid" || s.status === "delivered"
                                ? "inline-flex items-center gap-1 text-gold"
                                : "inline-flex items-center gap-1 text-muted-foreground"
                            }
                          >
                            {s.status === "pending" ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {s.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={statusMut.isPending}
                              onClick={() => statusMut.mutate({ id: s.id, status: "paid" })}
                            >
                              Mark paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="clay mt-8 overflow-x-auto">
            {users.length === 0 ? (
              <p className="p-8 text-sm text-muted-foreground">
                Abhi koi user nahi — pehla signup hote hi yahan dikhega.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0">
                      <td className="px-5 py-4 font-semibold"><p>{u.full_name || "Unnamed user"}</p><p className="text-xs text-muted-foreground">{u.email || u.id.slice(0, 8)}</p></td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        {u.banned ? (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <Ban className="h-3.5 w-3.5" /> Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          variant={u.banned ? "hero" : "outline"}
                          disabled={banMut.isPending}
                          onClick={() => banMut.mutate({ id: u.id, banned: !u.banned })}
                        >
                          {u.banned ? "Unban" : "Ban"}
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Edit user" title="Edit user" onClick={() => setEditing({ id: u.id, full_name: u.full_name })}><Pencil /></Button>
                        <Button size="icon" variant="ghost" aria-label="Delete user" title="Delete user" disabled={deleteMut.isPending} onClick={() => { if (window.confirm("Remove this user and disable their access? Payment records will be retained.")) deleteMut.mutate(u.id); }}><Trash2 /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Deposits */}
        {tab === "deposits" && (
          <div className="clay mt-8 overflow-x-auto">
            {deposits.length === 0 ? (
              <p className="p-8 text-sm text-muted-foreground">
                Abhi koi deposit request nahi — user payment request bhejte hi yahan aayegi. Approve karte hi user ko credit mil jayega.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Note</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id} className="border-b border-border/50 last:border-0">
                      <td className="px-5 py-4 font-mono text-xs">{d.user_id.slice(0, 8)}…</td>
                      <td className="px-5 py-4 font-semibold text-gold">{formatINR(d.amount_inr)}</td>
                      <td className="px-5 py-4 text-muted-foreground">{d.note || "—"}</td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            d.status === "approved"
                              ? "inline-flex items-center gap-1 text-gold"
                              : d.status === "rejected"
                                ? "inline-flex items-center gap-1 text-destructive"
                                : "inline-flex items-center gap-1 text-muted-foreground"
                          }
                        >
                          {d.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : d.status === "rejected" ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {d.status === "pending" && (
                          <span className="flex gap-2">
                            <Button
                              size="sm"
                              variant="hero"
                              disabled={depositMut.isPending}
                              onClick={() => depositMut.mutate({ id: d.id, status: "approved" })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={depositMut.isPending}
                              onClick={() => depositMut.mutate({ id: d.id, status: "rejected" })}
                            >
                              Reject
                            </Button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Templates */}
        {tab === "templates" && (
          <>
            <p className="mt-8 text-sm text-muted-foreground">
              {new Set(templates.map((t) => t.category)).size} categories · Total {templates.length} templates · {templates.filter((t) => t.active).length} live ·{" "}
              {templates.filter((t) => t.featured).length} featured
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <div key={t.id} className="clay overflow-x-auto">
                  <img src={t.cover_image} alt={t.title} loading="lazy" className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.category}</p>
                    <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
                    {priceEdit?.id === t.id ? (
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Sale</span>
                          <span className="font-semibold">₹</span>
                          <input
                            inputMode="numeric"
                            value={priceEdit.price}
                            onChange={(e) => setPriceEdit({ ...priceEdit, price: e.target.value.replace(/\D/g, "") })}
                            className="clay-pressed w-24 rounded-xl bg-muted px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">MRP</span>
                          <span className="font-semibold">₹</span>
                          <input
                            inputMode="numeric"
                            value={priceEdit.original}
                            onChange={(e) => setPriceEdit({ ...priceEdit, original: e.target.value.replace(/\D/g, "") })}
                            className="clay-pressed w-24 rounded-xl bg-muted px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="mt-1 flex gap-2">
                          <Button
                            size="sm"
                            variant="hero"
                            disabled={priceMut.isPending || !priceEdit.price || Number(priceEdit.original) < Number(priceEdit.price)}
                            onClick={() =>
                              priceMut.mutate({ id: t.id, price_inr: Number(priceEdit.price), original_price_inr: Number(priceEdit.original) || Number(priceEdit.price) })
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setPriceEdit(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPriceEdit({ id: t.id, price: String(t.price_inr), original: String(t.original_price_inr) })}
                        className="mt-1 inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
                      >
                        <Pencil className="h-3 w-3" /> {formatINR(t.price_inr)}
                      </button>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant={t.active ? "hero" : "outline"}
                        disabled={toggleMut.isPending}
                        onClick={() => toggleMut.mutate({ id: t.id, field: "active", value: !t.active })}
                      >
                        {t.active ? "Live" : "Hidden"}
                      </Button>
                      <Button
                        size="sm"
                        variant={t.featured ? "hero" : "outline"}
                        disabled={toggleMut.isPending}
                        onClick={() => toggleMut.mutate({ id: t.id, field: "featured", value: !t.featured })}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> {t.featured ? "Featured" : "Feature"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Settings */}
        {tab === "settings" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="clay p-8">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                <Wrench className="h-5 w-5 text-primary" /> Maintenance Mode
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                On karne par visitors ko maintenance page dikhega. Admin panel hamesha khula rahega.
              </p>
              <div className="mt-5">
                <Button
                  variant={settings["maintenance_mode"] === "on" ? "hero" : "outline"}
                  disabled={settingMut.isPending}
                  onClick={() =>
                    settingMut.mutate({
                      key: "maintenance_mode",
                      value: settings["maintenance_mode"] === "on" ? "off" : "on",
                    })
                  }
                >
                  {settings["maintenance_mode"] === "on" ? "Maintenance ON" : "Maintenance OFF"}
                </Button>
              </div>
            </div>

            <div className="clay p-8">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                <Megaphone className="h-5 w-5 text-primary" /> Announcement Message
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ye message har visitor ko website kholte hi ek baar dikhega (24 ghante mein ek baar).
              </p>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={3}
                className="clay-pressed mt-4 w-full rounded-2xl bg-muted p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Apna message likhiye…"
              />
              <Button
                className="mt-4"
                variant="hero"
                disabled={settingMut.isPending}
                onClick={() => settingMut.mutate({ key: "announcement", value: announcement })}
              >
                Save Message
              </Button>
            </div>
          </div>
        )}
      </main>
      {editing && <div role="dialog" aria-label="Edit user" className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/20 p-6"><form className="clay w-full max-w-sm space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); editMut.mutate(editing); }}><h2 className="text-2xl">Edit user</h2><label className="block">Full name<input className="mt-2 w-full rounded-xl border bg-background p-3" value={editing.full_name} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} maxLength={100} /></label><div className="flex gap-2"><Button type="submit" disabled={editMut.isPending}>Save</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form></div>}
      <SiteFooter />
    </div>
  );
}
