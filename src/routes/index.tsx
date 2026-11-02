import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Heart, Quote, Sparkles, Star } from "lucide-react";
import { ClayIcon, type ClayIconName } from "@/components/ClayIcon";
import { templatesQuery } from "@/lib/templates.functions";
import { TemplateCard } from "@/components/TemplateCard";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Petals } from "@/components/Petals";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RGX4YOU — Surprise Websites for People You Love" },
      {
        name: "description",
        content:
          "Create a magical personalised surprise website — birthday, proposal, invitation or love letter — with photos, music and a secret link. Starting at ₹0.",
      },
      { property: "og:title", content: "RGX4YOU — Surprise Websites for People You Love" },
      {
        property: "og:description",
        content:
          "Create a magical personalised surprise website with photos, music and a secret link. Starting at ₹0.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(templatesQuery()),
  component: Home,
});

const REVIEWS = [
  {
    name: "Ananya Sharma",
    city: "Mumbai",
    text: "I made this for my boyfriend's birthday — when he opened the link and the music started, his eyes filled with tears. Best gift ever, seriously.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    city: "Delhi",
    text: "I used the Proposal template. She pressed 'Yes' at the end and we both cried. Such a beautiful moment for ₹449 — unbelievable.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    city: "Bengaluru",
    text: "We sent our wedding invitation from here. Everyone asked which designer made it! Royal look, smooth music — guests still talk about it.",
    rating: 5,
  },
  {
    name: "Arjun Singh",
    city: "Jaipur",
    text: "I made a Rakhi surprise for my sister, ready in 2 minutes. She was at her hostel and cried on our video call: 'best gift ever'. Worth every rupee.",
    rating: 5,
  },
  {
    name: "Kavya Reddy",
    city: "Hyderabad",
    text: "I used the Golden Anniversary template. Seeing the timeline with 10 years of our photos made my husband emotional.",
    rating: 5,
  },
];

const PROOF: { value: string; label: string; icon: ClayIconName }[] = [
  { value: "12,000+", label: "Surprises delivered", icon: "orders" },
  { value: "4.9★", label: "Average rating", icon: "rating" },
  { value: "2 min", label: "To create yours", icon: "time" },
  { value: "98%", label: "Said it made them cry (happy tears)", icon: "tears" },
];

const MARQUEE_IMAGES = [
  "/images/t-birthday.jpg",
  "/images/t-proposal.jpg",
  "/images/t-wedding.jpg",
  "/images/t-anniversary.jpg",
  "/images/t-love.jpg",
  "/images/t-friendship.jpg",
  "/images/t-rakhi.jpg",
  "/images/t-congrats.jpg",
  "/images/t-flipbook.jpg",
];

function Home() {
  const { data: templates } = useSuspenseQuery(templatesQuery());
  const featured = [...templates].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 6);
  const trending = [...templates].sort((a, b) => Number(b.rating) - Number(a.rating));
  const categories = ["all", ...Array.from(new Set(templates.map((t) => t.category)))];
  const [cat, setCat] = useState("all");
  const byCat = cat === "all" ? templates : templates.filter((t) => t.category === cat);
  const [reviewIdx, setReviewIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setReviewIdx((i) => (i + 1) % REVIEWS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const review = REVIEWS[reviewIdx] ?? REVIEWS[0];
  if (!review) return null;

  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Petals />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-40 ">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-blush">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Made for moments that matter
            </p>
            <h1 className="mt-6 font-display text-6xl font-semibold leading-[1.05] ">
              Gift them a <span className="text-rose-gradient">website</span>, not just a message.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Pick a template, add your photos and feelings, and share a secret link that opens into
              a cinematic surprise — with music, petals and your story.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/templates">
                  Explore Templates <ArrowRight />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Starting at <span className="font-semibold text-gold">₹0</span> · Ready in 2 minutes
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-8 rounded-[3rem] bg-rose-gradient opacity-25 blur-3xl" />
            <img
              src="/images/hero-clay.jpg"
              fetchPriority="high"
              alt="A clay phone showing a surprise website with a smiling heart"
              width={896}
              height={1152}
              className="relative w-full rotate-2 rounded-[3rem] shadow-card transition-transform duration-500 hover:rotate-0"
            />
            <div className="clay-sm absolute -left-8 top-10 flex -rotate-6 animate-wobble items-center gap-2 px-4 py-2.5 text-sm font-bold">
              <Heart className="h-4 w-4 fill-primary text-primary" /> 12,000+ smiles
            </div>
            <div className="clay-sm absolute -right-6 bottom-16 flex rotate-3 items-center gap-2 px-4 py-2.5 text-sm font-bold">
              <ClayIcon name="music" className="h-6 w-6" /> Music included
            </div>
          </div>
        </div>
      </section>

      {/* Proof stats */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-12 ">
          {PROOF.map((p) => (
            <div key={p.label} className="glass rounded-3xl px-3 py-5 text-center">
              <ClayIcon name={p.icon} className="mx-auto h-12 w-12" />
              <p className="mt-2 font-display text-3xl font-semibold text-gold ">{p.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Photo marquee slider */}
      <section className="overflow-hidden py-16">
        <div className="flex w-max animate-marquee gap-6">
          {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Surprise template preview"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-52 w-52 rounded-3xl object-cover shadow-card  "
            />
          ))}
        </div>
      </section>

      {/* Featured templates */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blush/80">Loved by thousands</p>
            <h2 className="mt-2 font-display text-5xl font-semibold">
              Featured <span className="text-rose-gradient">Templates</span>
            </h2>
          </div>
          <Button asChild variant="glass">
            <Link to="/templates">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6  ">
          {featured.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-blush/80">Most loved</p>
        <h2 className="mt-2 font-display text-4xl font-semibold">Trending <span className="text-rose-gradient">now</span></h2>
        <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4">
          {trending.map((t) => (
            <div key={t.id} className="w-64 shrink-0 snap-start"><TemplateCard t={t} /></div>
          ))}
        </div>
      </section>

      {/* By category */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-blush/80">For every occasion</p>
        <h2 className="mt-2 font-display text-4xl font-semibold">Browse by <span className="text-rose-gradient">occasion</span></h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm capitalize transition-colors ${cat === c ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
              {c === "all" ? "All" : c.replace(/-/g, " ")}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6  ">
          {byCat.map((t) => <TemplateCard key={t.id} t={t} />)}
        </div>
      </section>

      {/* Reviews — spotlight slider + clay cards */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Real stories</p>
            <h2 className="mt-2 font-display text-5xl font-semibold">
              They said <span className="font-script text-6xl text-gold">yes</span> to tears of joy
            </h2>
          </div>

          {/* Spotlight review */}
          <div className="clay relative mx-auto mt-12 max-w-3xl p-10 text-center ">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-gradient text-primary-foreground shadow-glow">
              <Quote className="h-6 w-6" />
            </div>
            <p className="mt-6 min-h-28 font-display text-2xl leading-relaxed ">
              “{review.text}”
            </p>
            <div className="mt-6 flex items-center justify-center gap-1">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-3 text-sm font-bold">{review.name}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{review.city}</p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous review"
                onClick={() => setReviewIdx((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)}
              >
                <ChevronLeft />
              </Button>
              <div className="flex gap-2">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to review ${i + 1}`}
                    onClick={() => setReviewIdx(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === reviewIdx ? "w-7 bg-primary" : "w-2.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next review"
                onClick={() => setReviewIdx((i) => (i + 1) % REVIEWS.length)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          {/* All reviews as clay cards */}
          <div className="mt-10 grid gap-5  ">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setReviewIdx(i)}
                className={`clay-sm p-6 text-left transition-transform hover:-translate-y-1 hover:rotate-1 ${
                  i === reviewIdx ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">“{r.text}”</p>
                <p className="mt-4 text-sm font-bold">{r.name}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{r.city}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-5xl font-semibold">
            Three steps to their <span className="font-script text-6xl text-gold">smile</span>
          </h2>
          <div className="mt-14 grid gap-6 ">
            {([
              {
                icon: "templates",
                title: "Pick a template",
                text: "Birthday, proposal, invitation, friendship — choose the mood that fits your moment.",
              },
              {
                icon: "create",
                title: "Make it yours",
                text: "Add their name, your photos and a heartfelt message. We wrap it in music and magic.",
              },
              {
                icon: "share",
                title: "Share the link",
                text: "Send the secret link on WhatsApp. They open it — and the surprise unfolds.",
              },
            ] satisfies { icon: ClayIconName; title: string; text: string }[]).map((s, i) => (
              <div key={s.title} className="clay p-8 transition-transform hover:-translate-y-1 hover:rotate-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl glass">
                  <ClayIcon name={s.icon} className="h-12 w-12" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-rose-gradient p-12 text-center text-primary-foreground ">
          <h2 className="font-display text-5xl font-semibold ">
            Someone is waiting to smile.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/85">
            Create your first surprise in two minutes — the love letter template is free forever.
          </p>
          <Button asChild size="lg" variant="glass" className="mt-8">
            <Link to="/templates">
              Start Creating <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
