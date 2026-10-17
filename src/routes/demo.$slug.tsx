import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { templateQuery } from "@/lib/templates.functions";
import { SurpriseExperience } from "@/components/SurpriseExperience";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/demo/$slug")({
  loader: async ({ context, params }) => {
    const t = await context.queryClient.ensureQueryData(templateQuery(params.slug));
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Live Demo: ${loaderData?.title ?? "Template"} — Always4you` },
      { name: "description", content: "Try the interactive live demo — music, games, memories and a love letter." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Live Demo: ${loaderData?.title ?? "Template"} — Always4you` },
      { property: "og:description", content: "Preview an interactive Always4you surprise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const { slug } = Route.useParams();
  const { data: t } = useSuspenseQuery(templateQuery(slug));
  if (!t) return null;
  return (
    <div className="relative">
      <SurpriseExperience category={t.category} recipient="Jaan" sender="Your Name" headline={t.title}
        message={"Ye sirf ek demo hai 💖\nAsli surprise mein yahan aapka apna naam, photos aur dil ki baat hogi — bilkul aise hi music aur animations ke saath."}
        cover={t.cover_image} photos={[t.cover_image, "/images/hero.jpg", "/images/hero-clay.jpg"]} />
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center gap-3 px-4">
        <Button asChild variant="glass" size="sm"><Link to="/templates/$slug" params={{ slug }}><ArrowLeft />Back</Link></Button>
        <Button asChild variant="hero" size="sm"><Link to="/templates/$slug" params={{ slug }}><ShoppingBag />Ye template lein</Link></Button>
      </div>
    </div>
  );
}
