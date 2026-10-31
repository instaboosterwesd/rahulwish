import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { templatesQuery } from "@/lib/templates.functions";
import { TemplateCard } from "@/components/TemplateCard";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { filterTemplates } from "@/lib/template-search";

export const Route = createFileRoute("/templates/")({
  head: () => ({ meta: [
    { title: "Templates — RGX4YOU" },
    { name: "description", content: "Birthday, proposal, invitation and flipbook surprise website templates." },
    { property: "og:title", content: "Templates — RGX4YOU" },
    { property: "og:description", content: "Birthday, proposal, invitation and flipbook surprise website templates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(templatesQuery()),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(templatesQuery());
  const [query, setQuery] = useState("");
  const results = filterTemplates(data, query);
  const searching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        <h1 className="text-5xl font-semibold ">All <span className="text-rose-gradient">Templates</span></h1>

        <div className="sticky top-[72px] z-40 -mx-6 mt-6 bg-night/90 px-6 py-3 backdrop-blur">
          <label className="flex items-center gap-2 rounded-full glass px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              aria-label="Search templates"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {searching && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {results.length} {results.length === 1 ? "template" : "templates"}
            {searching ? ` for “${query.trim()}”` : ""}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-[2rem] glass p-8 text-center">
            <p className="text-lg font-semibold">No template found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nothing matches “{query.trim()}”. Try a different word like birthday, heart or apology.
            </p>
            <button type="button" onClick={() => setQuery("")}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              Show all templates
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6  ">
            {results.map((t) => <TemplateCard key={t.id} t={t} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
