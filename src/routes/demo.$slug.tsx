import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Music, Pause } from "lucide-react";
import { templateQuery } from "@/lib/templates.functions";
import { Petals } from "@/components/Petals";
import { MusicBox } from "@/lib/music";
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
      { name: "description", content: "Is template ka live demo dekhiye — music, petals aur magic ke saath." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Live Demo: ${loaderData?.title ?? "Template"} — Always4you` },
      { property: "og:description", content: "Preview an Always4you surprise with music and a personal message." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const { slug } = Route.useParams();
  const { data: t } = useSuspenseQuery(templateQuery(slug));
  const [playing, setPlaying] = useState(false);
  const boxRef = useRef<MusicBox | null>(null);

  useEffect(() => () => boxRef.current?.stop(), []);

  const toggleMusic = () => {
    if (!boxRef.current) boxRef.current = new MusicBox();
    if (playing) {
      boxRef.current.stop();
      setPlaying(false);
    } else {
      boxRef.current.start();
      setPlaying(true);
    }
  };

  if (!t) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-night px-6 py-16 text-center">
      <Petals count={24} />
      <Button asChild variant="glass" size="sm" className="absolute left-6 top-6 z-20">
        <Link to="/templates/$slug" params={{ slug }}>
          <ArrowLeft /> Back
        </Link>
      </Button>

      <p className="animate-rise text-xs uppercase tracking-[0.3em] text-primary/70">
        Live demo — {t.title}
      </p>
      <h1 className="mt-4 max-w-2xl animate-rise font-display text-5xl font-semibold leading-tight md:text-7xl">
        For someone <span className="text-rose-gradient">special</span>
      </h1>
      <p className="mt-6 max-w-md animate-rise text-lg text-muted-foreground">
        Ye sirf ek demo hai. Asli surprise mein yahan aapka apna naam, photos aur message hoga — bilkul
        aise hi music aur petals ke saath.
      </p>

      <div className="clay mt-10 w-full max-w-md overflow-hidden">
        <img src={t.cover_image} alt={t.title} className="h-56 w-full object-cover" />
        <div className="p-6">
          <Heart className="mx-auto h-8 w-8 animate-heartbeat fill-primary text-primary" />
          <p className="mt-3 font-script text-4xl text-gold">Made with love</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button variant="hero" size="lg" onClick={toggleMusic}>
          {playing ? <Pause /> : <Music />} {playing ? "Music band karein" : "Music chalayein"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/templates/$slug" params={{ slug }}>
            Ye template lein
          </Link>
        </Button>
      </div>
    </div>
  );
}
