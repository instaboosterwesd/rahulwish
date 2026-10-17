import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { templatesQuery } from "@/lib/templates.functions";
import { TemplateCard } from "@/components/TemplateCard";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/templates/")({
  head: () => ({ meta: [
    { title: "Templates — Always4you" },
    { name: "description", content: "Birthday, proposal, invitation and flipbook surprise website templates." },
    { property: "og:title", content: "Templates — Always4you" },
    { property: "og:description", content: "Birthday, proposal, invitation and flipbook surprise website templates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(templatesQuery()),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(templatesQuery());
  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <h1 className="text-5xl font-semibold md:text-6xl">All <span className="text-rose-gradient">Templates</span></h1>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => <TemplateCard key={t.id} t={t} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
