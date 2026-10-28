import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-primary text-primary animate-heartbeat" />
          <span className="font-display text-2xl font-semibold tracking-tight">
            RJX<span className="text-rose-gradient">4</span>You
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
          <Link to="/admin" className="text-gold hover:brightness-110" activeProps={{ className: "text-gold brightness-110" }}>
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu /></Button>
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
      {menuOpen && <nav className="glass mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden"><Button asChild variant="ghost"><Link to="/templates" onClick={() => setMenuOpen(false)}>Templates</Link></Button>{user && <Button asChild variant="ghost"><Link to="/my" onClick={() => setMenuOpen(false)}>My surprises</Link></Button>}<Button asChild variant="ghost"><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></Button></nav>}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <p className="font-display text-xl text-foreground">
          RJX<span className="text-rose-gradient">4</span>You
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
