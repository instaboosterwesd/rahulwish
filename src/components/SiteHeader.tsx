import { Link } from "@tanstack/react-router";
import { Heart, LayoutGrid, Package, User, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="app-fixed top-0 z-50 px-4 pt-3">
      <div className="flex items-center justify-between rounded-full glass px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-primary text-primary animate-heartbeat" />
          <span className="font-display text-xl font-semibold tracking-tight">
            RGX<span className="text-rose-gradient">4</span>YOU
          </span>
        </Link>
        {user ? (
          <Link to="/profile" aria-label="Profile" className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </Link>
        ) : (
          <Link to="/auth" className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">Sign in</Link>
        )}
      </div>
    </header>
  );
}

const tabs = [
  { to: "/templates", label: "Templates", icon: LayoutGrid },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="Main" className="app-fixed bottom-0 z-50 px-3 pb-3">
      <div className="grid grid-cols-4 rounded-3xl glass px-1 py-1.5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] text-muted-foreground"
            activeProps={{ className: "bg-primary/15 text-primary font-semibold" }}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return <div className="h-24" aria-hidden />;
}
