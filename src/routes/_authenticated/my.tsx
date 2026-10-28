import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Eye, Gift, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerQuery, requestDeposit } from "@/lib/customer.functions";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/my")({
  loader: ({ context }) => context.queryClient.ensureQueryData(customerQuery()),
  head: () => ({ meta: [{ title: "My surprises — RJX4You" }, { name: "description", content: "Your surprises, approved credit and deposit requests." }, { property: "og:title", content: "My surprises — RJX4You" }, { property: "og:description", content: "Your surprises, approved credit and deposit requests." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});
function Page() {
  const { data } = useSuspenseQuery(customerQuery());
  const qc = useQueryClient();
  const request = useServerFn(requestDeposit);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const mutation = useMutation({ mutationFn: () => request({ data: { amount: Number(amount), note } }), onSuccess: () => { setAmount(""); setNote(""); qc.invalidateQueries({ queryKey: ["customer-dashboard"] }); toast.success("Deposit request sent"); }, onError: (e) => toast.error(e.message) });
  return <div className="min-h-screen bg-night"><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-20 pt-32">
    <p className="text-sm text-muted-foreground">{data.profile.full_name || data.profile.email}</p><h1 className="mt-2 text-4xl md:text-5xl">My surprises</h1>
    <div className="mt-8 flex flex-wrap items-center gap-6 border-y border-border py-6"><Wallet className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Available approved credit</p><p className="text-3xl font-bold">{formatINR(data.balance)}</p></div><Button asChild variant="hero" className="sm:ml-auto"><Link to="/templates"><Gift /> Browse templates</Link></Button></div>
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.surprises.map((s) => <article key={s.id} className="clay overflow-hidden"><img src={s.templates?.cover_image} alt={s.templates?.title} className="aspect-[4/3] w-full object-cover" /><div className="p-5"><p className="text-xs text-primary">{s.status}</p><h2 className="mt-1 text-xl">{s.templates?.title}</h2><p className="mt-2 text-sm text-muted-foreground">For {s.recipient_name || "—"}</p><p className="mt-1 flex items-center gap-1 text-sm"><Eye className="h-4 w-4 text-primary" /> {(s as { views?: number }).views ?? 0} views</p><div className="mt-5 flex flex-wrap gap-2">{["paid", "delivered"].includes(s.status) && <><Button asChild size="sm"><Link to="/customize/$id" params={{ id: s.id }}>Customize</Link></Button><Button asChild size="sm" variant="outline"><Link to="/surprise/$code" params={{ code: s.code }}><Eye /> Live view</Link></Button><Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/surprise/${s.code}`); toast.success("Link copied"); }}>Copy link</Button></>}</div></div></article>)}</div>
    {data.surprises.length === 0 && <div className="py-12 text-center"><Gift className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-2xl">Your first surprise awaits</h2><p className="mt-2 text-muted-foreground">No surprises yet.</p></div>}
    <section className="mt-12 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1fr_2fr]"><form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4"><h2 className="text-2xl">Request deposit</h2><label className="block text-sm">Amount (₹)<Input aria-label="Deposit amount" className="mt-2" type="number" min={1} step={1} required value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label className="block text-sm">Note / payment reference<Input aria-label="Deposit note" className="mt-2" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></label><Button variant="hero" type="submit" disabled={mutation.isPending}>Send request</Button></form><div><h2 className="text-2xl">Deposit history</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3">Amount</th><th>Note</th><th>Status</th></tr></thead><tbody>{data.deposits.map((d) => <tr key={d.id} className="border-b"><td className="py-4">{formatINR(d.amount_inr)}</td><td className="max-w-48 break-words pr-3">{d.note || "—"}</td><td>{d.status}</td></tr>)}</tbody></table>{data.deposits.length === 0 && <p className="py-6 text-muted-foreground">No requests yet.</p>}</div></div></section>
  </main><SiteFooter /></div>;
}
