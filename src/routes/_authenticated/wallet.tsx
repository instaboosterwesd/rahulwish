import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Plus, Wallet } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { customerQuery } from "@/lib/customer.functions";
import { formatMoneyINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/wallet")({
  loader: ({ context }) => context.queryClient.ensureQueryData(customerQuery()),
  head: () => ({ meta: [{ title: "Wallet — RGX4YOU" }, { name: "description", content: "Your balance and deposit requests." }, { property: "og:title", content: "Wallet — RGX4YOU" }, { property: "og:description", content: "Your balance and deposit requests." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(customerQuery());
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);
  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />
      <main className="space-y-6 px-4 pt-24">
        <section className="rounded-3xl bg-primary p-6 text-primary-foreground" aria-label="Wallet balance">
          <div className="flex items-center justify-between">
            <Wallet className="h-7 w-7" />
            <Button variant="secondary" size="icon" aria-label="Add money" title="Add money" onClick={() => { setOpen(true); setPaymentUnavailable(false); }}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-3 text-sm opacity-90">Wallet balance</p>
          <p className="text-4xl font-bold">{formatMoneyINR(data.balance)}</p>
        </section>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] rounded-lg">
            <DialogHeader className="text-left">
              <DialogTitle className="tracking-normal">Add money</DialogTitle>
              <DialogDescription>Wallet top-up · FamPay</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); setPaymentUnavailable(true); }} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="top-up-amount" className="text-sm font-medium">Amount (₹)</label>
                <Input id="top-up-amount" type="number" inputMode="numeric" min={1} step={1} required placeholder="Enter amount" value={amount} onChange={(e) => { setAmount(e.target.value); setPaymentUnavailable(false); }} className="h-14 text-xl" />
              </div>
              {paymentUnavailable && <p role="status" className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">FamPay payment is not available yet. No payment was taken.</p>}
              <Button variant="hero" type="submit" className="w-full" disabled={!amount}>
                {Number(amount) > 0 ? `Pay ₹${amount}` : "Pay"}<ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <section>
          <h2 className="text-xl">History</h2>
          <ul className="mt-3 divide-y divide-border rounded-3xl glass">
            {data.deposits.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">{d.note || "Deposit"}</span>
                <span className="shrink-0 text-right"><b>{formatMoneyINR(d.amount_inr)}</b><br /><span className="text-xs capitalize text-primary">{d.status}</span></span>
              </li>
            ))}
            {data.deposits.length === 0 && <li className="p-4 text-sm text-muted-foreground">No transactions yet.</li>}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
