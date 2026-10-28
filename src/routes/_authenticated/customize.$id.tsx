import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Plus, Save, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { SurpriseExperience } from "@/components/SurpriseExperience";
import { customerQuery, saveSurprise, savePhotos, saveProposalConfig } from "@/lib/customer.functions";
import { proposalQuiz, proposalQuestionSchema, readProposalConfig, type ProposalQuestion } from "@/lib/proposal";
import { diwaliQuiz } from "@/lib/diwali";
import { karwaQuiz } from "@/lib/karwa";
import { uploadedExperienceKind } from "@/lib/uploaded-templates";

export const Route = createFileRoute("/_authenticated/customize/$id")({
  loader: async ({ context, params }) => { const data = await context.queryClient.ensureQueryData(customerQuery()); if (!data.surprises.some((s) => s.id === params.id && ["paid", "delivered"].includes(s.status))) throw notFound(); },
  head: () => ({ meta: [{ title: "Customize your surprise — RJX4You" }, { name: "description", content: "Add names, photos and questions, then preview your surprise live." }, { property: "og:title", content: "Customize your surprise — RJX4You" }, { property: "og:description", content: "Add names, photos and questions, then preview your surprise live." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Page,
});
function Page() {
  const { id } = Route.useParams(); const { data } = useSuspenseQuery(customerQuery()); const s = data.surprises.find((s) => s.id === id); if (!s) return null; return <Editor key={id} surprise={s} />;
}
type Surprise = Awaited<ReturnType<typeof import("@/lib/customer.functions").customerDashboard>>["surprises"][number];
const blankQuestion = (): ProposalQuestion => ({ question: "", options: ["", "", ""], answer: 0 });

function Editor({ surprise: s }: { surprise: Surprise }) {
  const category = s.templates?.category ?? "";
  const existing = readProposalConfig(s.proposal_config);
  const kindNow = uploadedExperienceKind(category);
  const defaults = kindNow === "karwa" ? karwaQuiz : kindNow === "diwali" ? diwaliQuiz : proposalQuiz;
  const [form, setForm] = useState({ id: s.id, recipient: s.recipient_name, sender: s.sender_name, headline: s.headline, message: s.message });
  const [quiz, setQuiz] = useState<ProposalQuestion[]>(existing.quiz?.length ? existing.quiz : defaults.map((q) => ({ ...q, options: [...q.options] })));
  const [preview, setPreview] = useState(false);
  const save = useServerFn(saveSurprise); const persistPhotos = useServerFn(savePhotos); const saveConfig = useServerFn(saveProposalConfig); const qc = useQueryClient();
  const [photoPaths, setPhotoPaths] = useState(s.photos);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const cleanQuiz = () => quiz.map((q) => ({ ...q, options: q.options.map((o) => o.trim()).filter(Boolean) })).filter((q) => q.question.trim());
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
  const mutation = useMutation({
    mutationFn: async () => {
      const questions = cleanQuiz();
      for (const [i, q] of questions.entries()) { const r = proposalQuestionSchema.safeParse(q); if (!r.success) throw new Error(`Question ${i + 1}: har sawaal ke kam se kam 2 options aur sahi jawaab chuniye`); }
      if (!questions.length) throw new Error("Kam se kam ek sawaal likhiye");
      await save({ data: form });
      await saveConfig({ data: { id: s.id, config: { ...existing, quiz: questions } } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customer-dashboard"] }); qc.invalidateQueries({ queryKey: ["surprise", s.code] }); toast.success("Surprise saved"); },
    onError: (e) => toast.error(e.message),
  });
  const setQ = (i: number, q: ProposalQuestion) => setQuiz(quiz.map((x, j) => (j === i ? q : x)));

  return <div className="min-h-screen bg-night"><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-12 pt-32">
    <Link to="/my" className="text-sm text-primary">← My surprises</Link><h1 className="mt-4 text-4xl">{s.templates?.title}</h1>
    <div className="mt-7 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setPreview(!preview)}><Eye />{preview ? "Edit details" : "Live preview"}</Button><Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/surprise/${s.code}`); toast.success("Link copied"); }}><Share2 />Copy link</Button></div>
    {preview ? <div className="mt-8"><SurpriseExperience {...form} category={category} photos={photoUrls} cover={s.templates?.cover_image ?? ""} proposalConfig={{ ...existing, quiz: cleanQuiz() }} /></div> :
    <form className="mt-8 max-w-2xl space-y-6" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <h2 className="text-2xl">1. Naam</h2>
      <label className="block">Jiske liye surprise hai<Input className="mt-2" value={form.recipient} required maxLength={100} onChange={(e) => setForm({ ...form, recipient: e.target.value })} /></label>
      <label className="block">Aapka naam<Input className="mt-2" value={form.sender} required maxLength={100} onChange={(e) => setForm({ ...form, sender: e.target.value })} /></label>
      <h2 className="text-2xl">2. Photos</h2>
      <label className="block"><input aria-label="Upload photos" type="file" accept="image/*" multiple disabled={uploading} className="block w-full text-sm" onChange={(e) => upload(e.target.files)} /><span className="mt-2 block text-sm text-muted-foreground">{uploading ? "Uploading…" : `${photoPaths.length} photos saved`}</span></label>
      <h2 className="text-2xl">3. Sawaal aur sahi jawaab</h2>
      {quiz.map((q, i) => <fieldset key={i} className="clay space-y-3 p-5">
        <div className="flex items-center gap-2"><Input aria-label={`Question ${i + 1}`} placeholder={`Sawaal ${i + 1}`} value={q.question} maxLength={300} onChange={(e) => setQ(i, { ...q, question: e.target.value })} />{quiz.length > 1 && <Button type="button" size="icon" variant="ghost" aria-label="Remove question" onClick={() => setQuiz(quiz.filter((_, j) => j !== i))}><Trash2 /></Button>}</div>
        {q.options.map((o, k) => <label key={k} className="flex items-center gap-3"><input type="radio" name={`answer-${i}`} checked={q.answer === k} onChange={() => setQ(i, { ...q, answer: k })} aria-label={`Option ${k + 1} is correct`} /><Input placeholder={`Option ${k + 1}`} value={o} maxLength={200} onChange={(e) => setQ(i, { ...q, options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} /></label>)}
        <p className="text-xs text-muted-foreground">Sahi jawaab ke saamne wala gola chuniye.</p>
      </fieldset>)}
      {quiz.length < 10 && <Button type="button" variant="outline" onClick={() => setQuiz([...quiz, blankQuestion()])}><Plus /> Sawaal jodiye</Button>}
      <label className="block">Chitthi (optional)<textarea className="mt-2 w-full rounded-xl border bg-background p-4" rows={5} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
      <Button type="submit" variant="hero" disabled={mutation.isPending}><Save />Save surprise</Button>
    </form>}
  </main></div>;
}
