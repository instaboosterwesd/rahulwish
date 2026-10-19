import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { surpriseQuery } from "@/lib/templates.functions";
import { SurpriseExperience } from "@/components/SurpriseExperience";

export const Route = createFileRoute("/surprise/$code")({
  loader: async ({ context, params }) => { const s = await context.queryClient.ensureQueryData(surpriseQuery(params.code)); if (!s) throw notFound(); return s; },
  head: () => ({ meta: [{ title: "A surprise for you — Always4you" }, { name: "description", content: "A personal surprise made with love." }, { property: "og:title", content: "A surprise for you — Always4you" }, { property: "og:description", content: "A personal surprise made with love." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
function Page() { const { code } = Route.useParams(); const { data: s } = useSuspenseQuery(surpriseQuery(code)); if (!s) return null; return <SurpriseExperience category={s.category} recipient={s.recipient_name} sender={s.sender_name} headline={s.headline} message={s.message} cover={s.cover_image} photos={s.photoUrls} proposalConfig={s.proposalConfig} audioUrl={s.audioUrl} />; }