import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { templateQuery } from "@/lib/templates.functions";
import { SurpriseExperience } from "@/components/SurpriseExperience";
import { Button } from "@/components/ui/button";
import { demoPhotos } from "@/lib/uploaded-templates";

export const Route = createFileRoute("/demo/$slug")({
  loader: async ({ context, params }) => {
    const t = await context.queryClient.ensureQueryData(templateQuery(params.slug));
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Live Demo: ${loaderData?.title ?? "Template"} — RJX4You` },
      { name: "description", content: "Try the interactive live demo — music, games, memories and a love letter." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Live Demo: ${loaderData?.title ?? "Template"} — RJX4You` },
      { property: "og:description", content: "Preview an interactive RJX4You surprise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.cover_image.startsWith('https://') ? [
        { property: 'og:image', content: loaderData.cover_image },
        { name: 'twitter:image', content: loaderData.cover_image },
      ] : []),
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
      <SurpriseExperience demo category={t.category} recipient="Jaan" sender="Your Name" headline={t.title}
        message={"Tumhare saath har chhota pal bhi khaas lagta hai. Tumhari muskurahat, tumhari baatein, aur tumhara saath — yahi meri favourite kahaani hai.\n\nI don't need a perfect life. I just want a life with you. Aaj, kal, aur hamesha."}
        cover={t.cover_image} photos={demoPhotos(t.category, t.cover_image)} />
      <div className="demo-actions fixed inset-x-0 bottom-4 z-40 flex justify-center gap-3 px-4">
        <Button asChild variant="glass" size="sm"><Link to="/templates/$slug" params={{ slug }}><ArrowLeft />Back</Link></Button>
        <Button asChild variant="hero" size="sm"><Link to="/templates/$slug" params={{ slug }}><ShoppingBag />Ye template lein</Link></Button>
      </div>
    </div>
  );
}
