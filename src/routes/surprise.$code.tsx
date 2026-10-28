import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { recordSurpriseView, surpriseQuery } from "@/lib/templates.functions";
import { SurpriseExperience } from "@/components/SurpriseExperience";

export const Route = createFileRoute("/surprise/$code")({
  loader: async ({ context, params }) => { const s = await context.queryClient.ensureQueryData(surpriseQuery(params.code)); if (!s) throw notFound(); return s; },
  head: () => ({ meta: [{ title: "A surprise for you — RGX4YOU" }, { name: "description", content: "A personal surprise made with love." }, { property: "og:title", content: "A surprise for you — RGX4YOU" }, { property: "og:description", content: "A personal surprise made with love." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});
function Page() { const { code } = Route.useParams(); const { data: s } = useSuspenseQuery(surpriseQuery(code)); useEffect(() => { const k = `viewed-${code}`; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); recordSurpriseView({ data: { code } }).catch(() => {}); }, [code]); if (!s) return null; return <SurpriseExperience category={s.category} recipient={s.recipient_name} sender={s.sender_name} headline={s.headline} message={s.message} cover={s.cover_image} photos={s.photoUrls} proposalConfig={s.proposalConfig} audioUrl={s.audioUrl} />; }