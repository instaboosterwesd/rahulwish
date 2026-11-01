import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, LogOut, Package, Shield, User, Wallet } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { customerQuery } from "@/lib/customer.functions";
import { formatMoneyINR } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { firebaseSignOut } from "@/lib/firebase-browser";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(customerQuery()),
  head: () => ({ meta: [{ title: "Profile — RGX4YOU" }, { name: "description", content: "Your RGX4YOU account." }, { property: "og:title", content: "Profile — RGX4YOU" }, { property: "og:description", content: "Your RGX4YOU account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(customerQuery());
  const { isAdmin } = useAuth();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const p = data.profile as typeof data.profile & { phone?: string | null; username?: string | null };
  const rows = [
    { to: "/orders", label: "My orders", icon: Package, extra: String(data.surprises.length) },
    { to: "/wallet", label: "Wallet", icon: Wallet, extra: formatMoneyINR(data.balance) },
    ...(isAdmin ? [{ to: "/admin", label: "Admin panel", icon: Shield, extra: "" }] : []),
  ] as const;
  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />
      <main className="space-y-5 px-4 pt-24">
        <section className="flex items-center gap-4 rounded-3xl glass p-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><User className="h-7 w-7" /></div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl">{p.full_name || "RGX4YOU user"}</h1>
            <p className="truncate text-sm text-muted-foreground">{p.username ? `@${p.username}` : p.email}</p>
          </div>
        </section>
        <ul className="divide-y divide-border rounded-3xl glass">
          {rows.map(({ to, label, icon: Icon, extra }) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <span className="flex-1">{label}</span>
                <span className="text-sm text-muted-foreground">{extra}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full" onClick={async () => { const { error } = await supabase.auth.signOut(); if (error) return; await firebaseSignOut().catch(() => undefined); queryClient.clear(); nav({ to: "/" }); }}>
          <LogOut /> Log out
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
