import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { purchaseTemplate } from "@/lib/customer.functions";
import { useState } from "react";
import { startFamPayment, type FamCheckout } from "@/lib/famgateway.functions";
import { FamPayDialog } from "@/components/FamPayDialog";
import { ArrowLeft, Eye, ShoppingBag, Star, Wallet } from "lucide-react";
import { templateQuery, templatesQuery } from "@/lib/templates.functions";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ClayIcon, type ClayIconName } from "@/components/ClayIcon";
import { Button } from "@/components/ui/button";
import { discountPercent, formatINR } from "@/lib/format";
import { friendlyActionError } from "@/lib/friendly-error";

export const Route = createFileRoute("/templates/$slug")({
  loader: async ({ context, params }) => {
    const [t] = await Promise.all([
      context.queryClient.ensureQueryData(templateQuery(params.slug)),
      context.queryClient.ensureQueryData(templatesQuery()),
    ]);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Template"} — RGX4YOU` },
    { name: "description", content: loaderData?.tagline ?? "Surprise website template" },
    { property: "og:title", content: `${loaderData?.title ?? "Template"} — RGX4YOU` },
    { property: "og:description", content: loaderData?.tagline ?? "Surprise website template" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    ...(loaderData?.cover_image.startsWith('https://') ? [
      { property: 'og:image', content: loaderData.cover_image },
      { name: 'twitter:image', content: loaderData.cover_image },
    ] : []),
  ] }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="px-6 pt-32 text-center">
        <h1 className="text-3xl font-semibold">Template not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed or renamed.</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/templates">See all templates</Link></Button>
      </main>
    </div>
  ),
  component: Page,
});

const INCLUDED: { icon: ClayIconName; title: string; text: string }[] = [
  { icon: "create", title: "Your words & photos", text: "Add their name, your message and pictures." },
  { icon: "music", title: "Music included", text: "A soft soundtrack plays as it opens." },
  { icon: "share", title: "Private link", text: "Share one link on WhatsApp or Instagram." },
  { icon: "time", title: "Ready in minutes", text: "Works on any phone, no app needed." },
];

function Page() {
  const { slug } = Route.useParams();
  const { user } = useAuth(); const navigate = useNavigate(); const qc = useQueryClient(); const buy = useServerFn(purchaseTemplate);
  const startPay = useServerFn(startFamPayment);
  const [checkout, setCheckout] = useState<FamCheckout | null>(null);
  const pay = useMutation({ mutationFn: (template: string) => startPay({ data: { template } }), onSuccess: setCheckout, onError: (e) => toast.error(friendlyActionError(e)) });
  const purchase = useMutation({ mutationFn: (template: string) => buy({ data: { template } }), onSuccess: (id) => { qc.invalidateQueries({ queryKey: ["customer-dashboard"] }); if (id) navigate({ to: "/customize/$id", params: { id } }); }, onError: (error) => toast.error(friendlyActionError(error)) });
  const { data: t } = useSuspenseQuery(templateQuery(slug));
  const { data: all } = useSuspenseQuery(templatesQuery());
  if (!t) return null;
  const off = discountPercent(t.price_inr, t.original_price_inr);
  const related = all.filter((x) => x.slug !== t.slug).slice(0, 4);
  const busy = pay.isPending || purchase.isPending;

  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-10 pt-24">
        <Link to="/templates" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> All templates
        </Link>

        <div className="relative mt-4 overflow-hidden rounded-[2rem] shadow-card">
          <img src={t.cover_image} alt={`${t.title} surprise website preview`} className="aspect-[4/5] w-full object-cover" />
          {t.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1 text-xs font-semibold text-accent-foreground">{t.badge}</span>
          )}
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs">
            <Star className="h-3 w-3 fill-gold text-gold" /> {Number(t.rating).toFixed(1)}
          </span>
          <Link to="/demo/$slug" params={{ slug }}
            className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-full glass-strong py-2.5 text-sm font-semibold">
            <Eye className="h-4 w-4" /> Watch the live demo
          </Link>
        </div>

        <section className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">{t.category}</p>
          <h1 className="mt-1 text-4xl font-semibold leading-tight">{t.title}</h1>
          {t.tagline && <p className="mt-1 text-base text-muted-foreground">{t.tagline}</p>}
          {t.description && t.description !== t.tagline && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.description}</p>}
        </section>

        <section className="mt-6 rounded-3xl glass p-5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-gold">{formatINR(t.price_inr)}</span>
            {t.original_price_inr > t.price_inr && (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatINR(t.original_price_inr)}</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">{off}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">One-time price · edit any time after buying</p>

          <div className="mt-4 grid gap-3">
            {user ? (t.price_inr > 0 ? (
              <>
                <Button variant="hero" size="lg" className="w-full" disabled={busy} onClick={() => pay.mutate(t.id)}>
                  <ShoppingBag /> {pay.isPending ? "Starting…" : `Pay ${formatINR(t.price_inr)} with UPI`}
                </Button>
                <Button variant="glass" size="lg" className="w-full" disabled={busy} onClick={() => purchase.mutate(t.id)}>
                  <Wallet /> {purchase.isPending ? "Please wait…" : "Use my wallet credit"}
                </Button>
              </>
            ) : (
              <Button variant="hero" size="lg" className="w-full" disabled={busy} onClick={() => purchase.mutate(t.id)}>
                <ShoppingBag /> {purchase.isPending ? "Please wait…" : "Get it free & customize"}
              </Button>
            )) : (
              <Button asChild variant="hero" size="lg" className="w-full"><Link to="/auth"><ShoppingBag /> Sign in to get this</Link></Button>
            )}
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/demo/$slug" params={{ slug }}><Eye /> Live demo</Link>
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">What you get</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {INCLUDED.map((item) => (
              <li key={item.title} className="rounded-3xl glass p-4">
                <ClayIcon name={item.icon} className="h-10 w-10" />
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="mt-3 space-y-2">
            {["Pick this template and get it", "Add names, message and photos", "Send the private link to them"].map((step, i) => (
              <li key={step} className="flex items-center gap-3 rounded-2xl glass px-4 py-3 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-gradient text-xs font-semibold text-primary-foreground">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">You may also like</h2>
            <div className="-mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-5">
              {related.map((r) => (
                <Link key={r.id} to="/templates/$slug" params={{ slug: r.slug }}
                  className="w-36 shrink-0 snap-start overflow-hidden rounded-3xl bg-card shadow-card">
                  <img src={r.cover_image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-gold">{formatINR(r.price_inr)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <FamPayDialog checkout={checkout} onClose={() => setCheckout(null)} />
      <SiteFooter />
    </div>
  );
}
