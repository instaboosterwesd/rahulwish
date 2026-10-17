import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Save, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { SurpriseView } from "@/components/SurpriseView";
import { customerQuery, saveSurprise, savePhotos } from "@/lib/customer.functions";
export const Route = createFileRoute("/_authenticated/customize/$id")({
  loader: async ({ context, params }) => { const data = await context.queryClient.ensureQueryData(customerQuery()); if (!data.surprises.some((s) => s.id === params.id && ["paid", "delivered"].includes(s.status))) throw notFound(); },
  head: () => ({ meta: [{ title: "Customize your surprise — Always4you" }, { name: "description", content: "Make your personal surprise and preview it live." }, { property: "og:title", content: "Customize your surprise — Always4you" }, { property: "og:description", content: "Make your personal surprise and preview it live." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Page,
});
function Page() {
  const { id } = Route.useParams(); const { data } = useSuspenseQuery(customerQuery()); const s = data.surprises.find((s) => s.id === id); if (!s) return null; return <Editor key={id} surprise={s} />;
}
function Editor({ surprise: s }: { surprise: Awaited<ReturnType<typeof import("@/lib/customer.functions").customerDashboard>>["surprises"][number] }) {
  const [form, setForm] = useState({ id: s.id, recipient: s.recipient_name, sender: s.sender_name, headline: s.headline, message: s.message }); const [preview, setPreview] = useState(false);
  const save = useServerFn(saveSurprise); const persistPhotos = useServerFn(savePhotos); const qc = useQueryClient();
  const [photoPaths, setPhotoPaths] = useState(s.photos);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files) return; setUploading(true);
    try {
      const { data } = await supabase.auth.getUser(); if (!data.user) throw new Error("Sign in required");
      const paths = [...photoPaths]; const urls = [...photoUrls];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) throw new Error("Please choose image files");
        const path = `${data.user.id}/${crypto.randomUUID()}`;
        const { error } = await supabase.storage.from("photos").upload(path, file, { contentType: file.type }); if (error) throw new Error(error.message);
        paths.push(path); urls.push(URL.createObjectURL(file));
      }
      await persistPhotos({ data: { id: s.id, photos: paths } }); setPhotoPaths(paths); setPhotoUrls(urls); toast.success("Photos saved"); qc.invalidateQueries({ queryKey: ["customer-dashboard"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Photo upload failed"); } finally { setUploading(false); }
  };
  const mutation = useMutation({ mutationFn: () => save({ data: form }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["customer-dashboard"] }); qc.invalidateQueries({ queryKey: ["surprise", s.code] }); toast.success("Surprise saved"); }, onError: (e) => toast.error(e.message) });
  return <div className="min-h-screen bg-night"><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-12 pt-32"><Link to="/my" className="text-sm text-primary">← My surprises</Link><h1 className="mt-4 text-4xl">{s.templates?.title}</h1><div className="mt-7 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setPreview(!preview)}><Eye />{preview ? "Edit details" : "Live preview"}</Button><Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/surprise/${s.code}`); toast.success("Link copied"); }}><Share2 />Copy link</Button></div>{preview ? <div className="mt-8"><SurpriseView {...form} photos={photoUrls} cover={s.templates?.cover_image ?? ""} /></div> : <form className="mt-8 max-w-2xl space-y-5" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>{([['recipient','Recipient name',100],['sender','Your name',100],['headline','Headline',200]] as const).map(([key,label,max]) => <label key={key} className="block">{label}<Input className="mt-2" value={form[key]} required={key !== "headline"} maxLength={max} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<label className="block">Photos<input aria-label="Upload photos" type="file" accept="image/*" multiple disabled={uploading} className="mt-2 block w-full text-sm" onChange={(e) => upload(e.target.files)} /><span className="mt-2 block text-sm text-muted-foreground">{uploading ? "Uploading…" : `${photoPaths.length} photos saved`}</span></label><label className="block">Your message<textarea className="mt-2 w-full rounded-xl border bg-background p-4" rows={7} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label><Button type="submit" variant="hero" disabled={mutation.isPending}><Save />Save surprise</Button></form>}</main></div>;
}
