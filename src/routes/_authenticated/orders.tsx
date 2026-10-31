import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Eye, Gift, Link2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { customerQuery } from "@/lib/customer.functions";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/orders")({
  loader: ({ context }) => context.queryClient.ensureQueryData(customerQuery()),
  head: () => ({ meta: [{ title: "My orders — RGX4YOU" }, { name: "description", content: "Your purchased surprise websites." }, { property: "og:title", content: "My orders — RGX4YOU" }, { property: "og:description", content: "Your purchased surprise websites." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(customerQuery());
  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />
      <main className="px-4 pt-24">
        <h1 className="font-display text-3xl">My orders</h1>
        <div className="mt-5 space-y-4">
          {data.surprises.map((s) => (
            <article key={s.id} className="clay flex gap-3 overflow-hidden p-3">
              <img src={s.templates?.cover_image} alt={s.templates?.title} className="h-24 w-20 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-primary">{s.status}</p>
                <h2 className="truncate text-lg">{s.templates?.title}</h2>
                <p className="text-xs text-muted-foreground">{formatINR(s.amount_inr)} · For {s.recipient_name || "—"} · <Eye className="inline h-3 w-3" /> {s.views ?? 0}</p>
                {["paid", "delivered"].includes(s.status) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button asChild size="sm"><Link to="/customize/$id" params={{ id: s.id }}>Edit</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link to="/surprise/$code" params={{ code: s.code }}>View</Link></Button>
                    <Button size="sm" variant="ghost" aria-label="Copy link" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/surprise/${s.code}`); toast.success("Link copied"); }}><Link2 /></Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        {data.surprises.length === 0 && (
          <div className="py-16 text-center">
            <Gift className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-2xl">No orders yet</h2>
            <Button asChild variant="hero" className="mt-5"><Link to="/templates">Browse templates</Link></Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
