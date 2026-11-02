import templates from "@/assets/icons/nav-templates.png";
import orders from "@/assets/icons/nav-orders.png";
import wallet from "@/assets/icons/nav-wallet.png";
import profile from "@/assets/icons/nav-profile.png";
import email from "@/assets/icons/auth-email.png";
import create from "@/assets/icons/perk-create.png";
import share from "@/assets/icons/perk-share.png";
import rating from "@/assets/icons/stat-rating.png";
import time from "@/assets/icons/stat-time.png";
import tears from "@/assets/icons/stat-tears.png";
import music from "@/assets/icons/hero-music.png";
import { cn } from "@/lib/utils";

const ICONS = { templates, orders, wallet, profile, email, create, share, rating, time, tears, music } as const;
export type ClayIconName = keyof typeof ICONS;

// Custom 3D clay icons shared across the site, so every section uses one visual language.
export function ClayIcon({ name, className }: { name: ClayIconName; className?: string }) {
  return (
    <img
      src={ICONS[name]}
      alt=""
      aria-hidden="true"
      width={192}
      height={192}
      loading="lazy"
      decoding="async"
      className={cn("clay-icon h-6 w-6", className)}
    />
  );
}
