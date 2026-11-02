import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Plus, Save, Share2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SurpriseExperience } from "@/components/SurpriseExperience";
import { addSurprisePhoto, customerQuery, removeSurprisePhoto, saveSurprise, saveProposalConfig, MAX_SURPRISE_PHOTOS } from "@/lib/customer.functions";
import { photoUrl, type CustomerOrder } from "@/lib/firebase-customer";
import { compressImage } from "@/lib/compress-image";
import { proposalQuiz, proposalQuestionSchema, readProposalConfig, type ProposalQuestion } from "@/lib/proposal";
import { diwaliQuiz } from "@/lib/diwali";
import { karwaQuiz } from "@/lib/karwa";
import { uploadedExperienceKind } from "@/lib/uploaded-templates";
import { newTemplateKind } from "@/lib/new-templates";

export const Route = createFileRoute("/_authenticated/customize/$id")({
  loader: async ({ context, params }) => { const data = await context.queryClient.ensureQueryData(customerQuery()); if (!data.surprises.some((s) => s.id === params.id && ["paid", "delivered"].includes(s.status))) throw notFound(); },
  head: () => ({ meta: [{ title: "Customize your surprise — RGX4YOU" }, { name: "description", content: "Add names, photos and questions, then preview your surprise live." }, { property: "og:title", content: "Customize your surprise — RGX4YOU" }, { property: "og:description", content: "Add names, photos and questions, then preview your surprise live." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Page,
});
function Page() {
  const { id } = Route.useParams(); const { data } = useSuspenseQuery(customerQuery()); const s = data.surprises.find((s) => s.id === id); if (!s) return null; return <Editor key={id} surprise={s} />;
}
type Surprise = CustomerOrder;
const blankQuestion = (): ProposalQuestion => ({ question: "", options: ["", "", ""], answer: 0 });

function Editor({ surprise: s }: { surprise: Surprise }) {
  const category = s.templates?.category ?? "";
  const existing = readProposalConfig(s.proposal_config);
  const kindNow = uploadedExperienceKind(category);
  const defaults = kindNow === "karwa" ? karwaQuiz : kindNow === "diwali" ? diwaliQuiz : proposalQuiz;
  const [form, setForm] = useState({ id: s.id, recipient: s.recipient_name, sender: s.sender_name, headline: s.headline, message: s.message });
  const [quiz, setQuiz] = useState<ProposalQuestion[]>(existing.quiz?.length ? existing.quiz : defaults.map((q) => ({ ...q, options: [...q.options] })));
  const [preview, setPreview] = useState(false);
  const extraKind = newTemplateKind(category);
  const [passcode, setPasscode] = useState(existing.passcode ?? "");
  const save = useServerFn(saveSurprise); const addPhoto = useServerFn(addSurprisePhoto); const dropPhoto = useServerFn(removeSurprisePhoto); const saveConfig = useServerFn(saveProposalConfig); const qc = useQueryClient();
  const [photoIds, setPhotoIds] = useState(s.photos);
  const photoUrls = photoIds.map((p) => photoUrl(s.id, p));
  const [uploading, setUploading] = useState(false);

  const cleanQuiz = () => quiz.map((q) => ({ ...q, options: q.options.map((o) => o.trim()).filter(Boolean) })).filter((q) => q.question.trim());
  const upload = async (files: FileList | null) => {
    if (!files?.length) return; setUploading(true);
    try {
      let ids = photoIds;
      for (const file of Array.from(files)) {
        if (ids.length >= MAX_SURPRISE_PHOTOS) throw new Error(`You can add up to ${MAX_SURPRISE_PHOTOS} photos.`);
        const image = await compressImage(file);
        ids = (await addPhoto({ data: { id: s.id, image } })).photos;
        setPhotoIds(ids);
      }
      toast.success("Photos saved"); qc.invalidateQueries({ queryKey: ["customer-dashboard"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Photo upload failed"); } finally { setUploading(false); }
  };
  const removePhoto = async (photo: string) => {
    try { setPhotoIds((await dropPhoto({ data: { id: s.id, photo } })).photos); qc.invalidateQueries({ queryKey: ["customer-dashboard"] }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not remove photo"); }
  };
  const mutation = useMutation({
    mutationFn: async () => {
      const questions = cleanQuiz();
      for (const [i, q] of questions.entries()) { const r = proposalQuestionSchema.safeParse(q); if (!r.success) throw new Error(`Question ${i + 1}: add at least 2 options and choose the correct answer`); }
      if (!extraKind && !questions.length) throw new Error("Add at least one question");
      if (extraKind === "secret" && passcode && !/^\d{4}$/.test(passcode)) throw new Error("Passcode must be 4 digits");
      await save({ data: form });
      const config = { ...existing, ...(questions.length ? { quiz: questions } : {}), ...(extraKind === "secret" && passcode ? { passcode } : {}) };
      await saveConfig({ data: { id: s.id, config } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customer-dashboard"] }); qc.invalidateQueries({ queryKey: ["surprise", s.code] }); toast.success("Surprise saved"); },
    onError: (e) => toast.error(e.message),
  });
  const setQ = (i: number, q: ProposalQuestion) => setQuiz(quiz.map((x, j) => (j === i ? q : x)));

  return <div className="min-h-screen bg-night"><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-36 pt-32">
    <Link to="/my" className="text-sm text-primary">← My surprises</Link><h1 className="mt-4 text-4xl">{s.templates?.title}</h1>
    <div className="mt-7 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setPreview(!preview)}><Eye />{preview ? "Edit details" : "Live preview"}</Button><Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/surprise/${s.code}`); toast.success("Link copied"); }}><Share2 />Copy link</Button></div>
    {preview ? <div className="mt-8"><SurpriseExperience {...form} category={category} photos={photoUrls} cover={s.templates?.cover_image ?? ""} proposalConfig={{ ...existing, quiz: cleanQuiz(), ...(passcode ? { passcode } : {}) }} /></div> :
    <form className="mt-8 max-w-2xl space-y-6" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
      <h2 className="text-2xl">1. Names</h2>
      <label className="block">Recipient name<Input className="mt-2" value={form.recipient} required maxLength={100} onChange={(e) => setForm({ ...form, recipient: e.target.value })} /></label>
      <label className="block">Your name<Input className="mt-2" value={form.sender} required maxLength={100} onChange={(e) => setForm({ ...form, sender: e.target.value })} /></label>
      <h2 className="text-2xl">2. Photos</h2>
      <label className="block"><input aria-label="Upload photos" type="file" accept="image/*" multiple disabled={uploading || photoIds.length >= MAX_SURPRISE_PHOTOS} className="block w-full text-sm" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} /><span className="mt-2 block text-sm text-muted-foreground">{uploading ? "Uploading…" : `${photoIds.length} of ${MAX_SURPRISE_PHOTOS} photos saved`}</span></label>
      {photoIds.length > 0 && <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">{photoIds.map((p, i) => <li key={p} className="relative overflow-hidden rounded-2xl bg-card"><img src={photoUrl(s.id, p)} alt={`Saved photo ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" /><Button type="button" size="icon" variant="secondary" aria-label={`Remove photo ${i + 1}`} className="absolute right-1 top-1 h-7 w-7 rounded-full" onClick={() => removePhoto(p)}><X className="h-4 w-4" /></Button></li>)}</ul>}
      {extraKind === "secret" && <label className="block">Secret passcode (4 digits, e.g. a birthday: 0512)<Input className="mt-2" inputMode="numeric" pattern="\d{4}" maxLength={4} placeholder="2005" value={passcode} onChange={(e) => setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>}
      {!extraKind && <><h2 className="text-2xl">3. Questions and correct answers</h2>
      {quiz.map((q, i) => <fieldset key={i} className="clay space-y-3 p-5">
        <div className="flex items-center gap-2"><Input aria-label={`Question ${i + 1}`} placeholder={`Question ${i + 1}`} value={q.question} maxLength={300} onChange={(e) => setQ(i, { ...q, question: e.target.value })} />{quiz.length > 1 && <Button type="button" size="icon" variant="ghost" aria-label="Remove question" onClick={() => setQuiz(quiz.filter((_, j) => j !== i))}><Trash2 /></Button>}</div>
        {q.options.map((o, k) => <label key={k} className="flex items-center gap-3"><input type="radio" name={`answer-${i}`} checked={q.answer === k} onChange={() => setQ(i, { ...q, answer: k })} aria-label={`Option ${k + 1} is correct`} /><Input placeholder={`Option ${k + 1}`} value={o} maxLength={200} onChange={(e) => setQ(i, { ...q, options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} /></label>)}
        <p className="text-xs text-muted-foreground">Select the circle next to the correct answer.</p>
      </fieldset>)}
      {quiz.length < 10 && <Button type="button" variant="outline" onClick={() => setQuiz([...quiz, blankQuestion()])}><Plus /> Add question</Button>}</>}
      <label className="block">Letter (optional)<textarea className="mt-2 w-full rounded-xl border bg-background p-4" rows={5} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
      <Button type="submit" variant="hero" disabled={mutation.isPending}><Save />Save surprise</Button>
    </form>}
  </main></div>;
}
