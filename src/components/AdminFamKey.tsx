import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFamKeyHint, adminSetFamKey } from "@/lib/famgateway.functions";

export function AdminFamKey() {
  const qc = useQueryClient();
  const getHint = useServerFn(adminFamKeyHint);
  const save = useServerFn(adminSetFamKey);
  const [key, setKey] = useState("");
  const hint = useQuery({ queryKey: ["fam-key-hint"], queryFn: () => getHint(), retry: false });
  const mut = useMutation({
    mutationFn: () => save({ data: { key } }),
    onSuccess: () => { setKey(""); qc.invalidateQueries({ queryKey: ["fam-key-hint"] }); toast.success("FamGateway API key saved"); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className="clay p-8">
      <h3 className="flex items-center gap-2 text-xl font-semibold"><KeyRound className="h-5 w-5 text-primary" /> FamGateway API Key</h3>
      <p className="mt-2 text-sm text-muted-foreground">UPI payments isi key se chalenge. Nayi key daal kar Save karein.</p>
      <p className="mt-3 text-sm">Current: <span className="font-mono">{hint.isError ? "setup pending" : hint.data?.hint ?? "default (built-in key)"}</span></p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
        <Input aria-label="FamGateway API key" type="password" autoComplete="off" placeholder="fam_..." value={key} onChange={(e) => setKey(e.target.value)} minLength={10} maxLength={200} required />
        <Button type="submit" variant="hero" disabled={mut.isPending}>Save Key</Button>
      </form>
    </div>
  );
}
