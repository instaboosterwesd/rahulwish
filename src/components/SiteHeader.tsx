import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-primary text-primary animate-heartbeat" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            Always<span className="text-rose-gradient">4</span>you
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/templates" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Templates
          </Link>
          {user && (
            <Link to="/my" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              My Surprises
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-gold hover:brightness-110">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button
              variant="glass"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut /> Sign out
            </Button>
          ) : (
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <p className="font-display text-xl text-foreground">
          Always<span className="text-rose-gradient">4</span>you
        </p>
        <p>Made with ❤ in India · Bring smiles to faces you love</p>
        <div className="flex gap-5">
          <Link to="/templates" className="hover:text-foreground">Templates</Link>
          <Link to="/auth" className="hover:text-foreground">Account</Link>
        </div>
      </div>
    </footer>
  );
}
