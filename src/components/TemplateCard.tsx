import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Template } from "@/lib/templates.functions";
import { discountPercent, formatINR } from "@/lib/format";

export function TemplateCard({ t }: { t: Template }) {
  const off = discountPercent(t.price_inr, t.original_price_inr);
  return (
    <Link
      to="/templates/$slug"
      params={{ slug: t.slug }}
      className="group relative block overflow-hidden rounded-3xl bg-card shadow-card transition-transform duration-500 hover:-translate-y-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={t.cover_image}
          alt={`${t.title} surprise website preview`}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        {t.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1 text-xs font-semibold text-accent-foreground">
            {t.badge}
          </span>
        )}
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs">
          <Star className="h-3 w-3 fill-gold text-gold" /> {Number(t.rating).toFixed(1)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-blush/80">{t.category}</p>
          <h3 className="mt-1 text-3xl font-semibold">{t.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{t.tagline}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-gold">{formatINR(t.price_inr)}</span>
            {t.original_price_inr > t.price_inr && (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatINR(t.original_price_inr)}</span>
                <span className="text-xs font-medium text-primary">{off}% off</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
