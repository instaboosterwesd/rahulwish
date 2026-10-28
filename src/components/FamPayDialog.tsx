import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { checkFamPayment, type FamCheckout } from "@/lib/famgateway.functions";
import { formatINR } from "@/lib/format";

export function FamPayDialog({ checkout, onClose }: { checkout: FamCheckout | null; onClose: () => void }) {
  const check = useServerFn(checkFamPayment);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [state, setState] = useState<"pending" | "expired">("pending");

  useEffect(() => {
    if (!checkout) return;
    setState("pending");
    let stop = false;
    const tick = async () => {
      if (stop) return;
      try {
        const r = await check({ data: { orderId: checkout.orderId } });
        if (r.status === "success" && r.surpriseId) {
          stop = true; toast.success("Payment received!");
          qc.invalidateQueries({ queryKey: ["customer-dashboard"] });
          onClose(); navigate({ to: "/customize/$id", params: { id: r.surpriseId } }); return;
        }
        if (r.status === "expired") { stop = true; setState("expired"); return; }
      } catch (e) { toast.error((e as Error).message); }
      if (!stop) timer = window.setTimeout(tick, 4000);
    };
    let timer = window.setTimeout(tick, 4000);
    return () => { stop = true; window.clearTimeout(timer); };
  }, [checkout?.orderId]);

  return (
    <Dialog open={!!checkout} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader><DialogTitle>Pay {checkout && formatINR(checkout.amount)} with UPI</DialogTitle><DialogDescription>Scan with any UPI app. Pay the exact amount — this page updates by itself.</DialogDescription></DialogHeader>
        {checkout && <>
          <img src={checkout.qrUrl} alt="UPI payment QR code" className="mx-auto aspect-square w-60 rounded-2xl bg-card p-2" />
          <p className="text-xs text-muted-foreground">UPI ID: {checkout.upiId}</p>
          <Button asChild variant="hero" className="sm:hidden"><a href={checkout.upiIntent}><Smartphone /> Open UPI app</a></Button>
          <Button asChild variant="outline"><a href={checkout.checkoutUrl} target="_blank" rel="noreferrer">Open payment page</a></Button>
          {state === "pending" ? <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Waiting for payment…</p> : <p className="text-sm text-destructive">This payment expired. Close and try again.</p>}
        </>}
      </DialogContent>
    </Dialog>
  );
}
