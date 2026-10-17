import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Gift, Heart, Music, Sparkles } from "lucide-react";
import { templatesQuery } from "@/lib/templates.functions";
import { TemplateCard } from "@/components/TemplateCard";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Petals } from "@/components/Petals";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Always4you — Surprise Websites for People You Love" },
      {
        name: "description",
        content:
          "Create a magical personalised surprise website — birthday, proposal, invitation or love letter — with photos, music and a secret link. Starting at ₹0.",
      },
      { property: "og:title", content: "Always4you — Surprise Websites for People You Love" },
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

function Home() {
  const { data: templates } = useSuspenseQuery(templatesQuery());
  const featured = templates.filter((t) => t.featured).slice(0, 6);

  return (
    <div className="min-h-screen bg-night">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Petals />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-40 md:grid-cols-2">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-blush">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Made for moments that matter
            </p>
            <h1 className="mt-6 font-display text-6xl font-semibold leading-[1.05] md:text-7xl">
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
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-rose-gradient opacity-20 blur-3xl" />
            <img
              src="/images/hero.jpg"
              alt="A romantic surprise website glowing on a phone"
              width={1024}
              height={1024}
              className="relative w-full rounded-[2.5rem] shadow-card"
            />
          </div>
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-5xl font-semibold">
            Three steps to their <span className="font-script text-6xl text-gold">smile</span>
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Gift,
                title: "Pick a template",
                text: "Birthday, proposal, invitation, friendship — choose the mood that fits your moment.",
              },
              {
                icon: Heart,
                title: "Make it yours",
                text: "Add their name, your photos and a heartfelt message. We wrap it in music and magic.",
              },
              {
                icon: Music,
                title: "Share the link",
                text: "Send the secret link on WhatsApp. They open it — and the surprise unfolds.",
              },
            ].map((s, i) => (
              <div key={s.title} className="rounded-3xl bg-card p-8 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-gradient text-primary-foreground">
                  <s.icon className="h-5 w-5" />
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
        <div className="relative overflow-hidden rounded-[2.5rem] bg-rose-gradient p-12 text-center text-primary-foreground md:p-20">
          <h2 className="font-display text-5xl font-semibold md:text-6xl">
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
