import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, LayoutDashboard, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  adminStatsQuery,
  adminSurprisesQuery,
  adminTemplatesQuery,
  adminSetSurpriseStatus,
  adminToggleTemplate,
} from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Always4you" },
      { name: "description", content: "Manage templates and surprises." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(adminStatsQuery()),
      context.queryClient.ensureQueryData(adminSurprisesQuery()),
      context.queryClient.ensureQueryData(adminTemplatesQuery()),
    ]),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const { data: stats } = useSuspenseQuery(adminStatsQuery());
  const { data: surprises } = useSuspenseQuery(adminSurprisesQuery());
  const { data: templates } = useSuspenseQuery(adminTemplatesQuery());

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["admin-surprises"] });
    qc.invalidateQueries({ queryKey: ["admin-templates"] });
  };

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "paid" | "delivered" }) =>
      adminSetSurpriseStatus({ data: v }),
    onSuccess: refresh,
  });
  const toggleMut = useMutation({
    mutationFn: (v: { id: string; field: "active" | "featured"; value: boolean }) =>
      adminToggleTemplate({ data: v }),
    onSuccess: refresh,
  });

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

        {/* Stats */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { label: "Templates", value: stats.templates },
            { label: "Surprises created", value: stats.surprises },
            { label: "Paid orders", value: stats.paid },
          ].map((s) => (
            <div key={s.label} className="rounded-3xl bg-card p-7 shadow-card">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-5xl font-semibold text-gold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Surprises */}
        <h2 className="mt-14 font-display text-3xl font-semibold">Recent Surprises</h2>
        <div className="mt-5 overflow-hidden rounded-3xl bg-card shadow-card">
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
                          variant="glass"
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

        {/* Templates */}
        <h2 className="mt-14 font-display text-3xl font-semibold">Templates</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-3xl bg-card shadow-card">
              <img src={t.cover_image} alt={t.title} loading="lazy" className="h-40 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-blush/80">{t.category}</p>
                <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-gold">{formatINR(t.price_inr)}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={t.active ? "hero" : "glass"}
                    disabled={toggleMut.isPending}
                    onClick={() => toggleMut.mutate({ id: t.id, field: "active", value: !t.active })}
                  >
                    {t.active ? "Live" : "Hidden"}
                  </Button>
                  <Button
                    size="sm"
                    variant={t.featured ? "hero" : "glass"}
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
      </main>
      <SiteFooter />
    </div>
  );
}
