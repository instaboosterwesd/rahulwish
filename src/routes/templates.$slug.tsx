import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Eye, ShoppingBag } from "lucide-react";
import { templateQuery } from "@/lib/templates.functions";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { discountPercent, formatINR } from "@/lib/format";

export const Route = createFileRoute("/templates/$slug")({
  loader: async ({ context, params }) => {
    const t = await context.queryClient.ensureQueryData(templateQuery(params.slug));
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Template"} — Always4you` },
    { name: "description", content: loaderData?.tagline ?? "Surprise website template" },
    { property: "og:title", content: `${loaderData?.title ?? "Template"} — Always4you` },
    { property: "og:description", content: loaderData?.tagline ?? "Surprise website template" },
  ] }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { data: t } = useSuspenseQuery(templateQuery(slug));
  if (!t) return null;
  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-32 md:grid-cols-2">
        <img src={t.cover_image} alt={t.title} className="w-full rounded-3xl shadow-card" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blush/80">{t.category}</p>
          <h1 className="mt-2 text-5xl font-semibold">{t.title}</h1>
          <p className="mt-4 text-muted-foreground">{t.description}</p>
          <p className="mt-6 text-3xl text-gold">{formatINR(t.price_inr)}
            {t.original_price_inr > t.price_inr && <span className="ml-3 text-base text-primary">{discountPercent(t.price_inr, t.original_price_inr)}% off</span>}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="hero" size="lg">
              <Link to="/templates/$slug" params={{ slug }}>
                <ShoppingBag /> Buy / Customize
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo/$slug" params={{ slug }}>
                <Eye /> Live Demo
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
