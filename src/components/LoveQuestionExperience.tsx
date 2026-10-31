import { useEffect, useState } from "react";
import { Heart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import questionAsset from "@/assets/love-question/question.gif.asset.json";
import answerAsset from "@/assets/love-question/answer.gif.asset.json";
import type { ExperienceProps } from "@/components/SurpriseExperience";

/** The uploaded love question, with bounded touch-friendly movement and local video assets. */
export function LoveQuestionExperience(p: ExperienceProps) {
  const [state, setState] = useState<"question" | "loading" | "answer">("question");
  const [noCount, setNoCount] = useState(0);
  useEffect(() => {
    if (state !== "loading") return;
    const timer = window.setTimeout(() => setState("answer"), 3000);
    return () => window.clearTimeout(timer);
  }, [state]);
  const positions = ["translate-x-0 translate-y-0", "translate-x-4 translate-y-16", "-translate-x-24 translate-y-20", "translate-x-2 translate-y-28"];
  return (
    <section className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-background px-5 pb-24 pt-10">
      <div className="w-full max-w-sm text-center">
        {state === "question" && <>
          <img className="mx-auto aspect-square w-64 max-w-full rounded-lg object-contain" src={questionAsset.url} alt="Cute characters asking for love" />
          <h1 className="mt-6 text-4xl font-semibold">Do you love me?</h1>
          {p.recipient && <p className="mt-3 text-lg text-muted-foreground">For {p.recipient} 💕</p>}
          <div className="relative mx-auto mt-7 flex h-44 w-64 max-w-full justify-center gap-6">
            <Button variant="hero" size="lg" onClick={() => setState("loading")}>Yes</Button>
            <Button variant="outline" size="lg" className={`transition-transform ${positions[noCount % positions.length]}`} onPointerEnter={(e) => { if (e.pointerType === "mouse") setNoCount((n) => n + 1); }} onClick={() => setNoCount((n) => n + 1)}>No</Button>
          </div>
        </>}
        {state === "loading" && <div role="status" className="flex flex-col items-center gap-5"><Heart className="h-24 w-24 animate-heartbeat fill-primary text-primary motion-reduce:animate-none" /><p className="text-xl">A little love is on its way…</p></div>}
        {state === "answer" && <>
          <img className="mx-auto aspect-square w-64 max-w-full rounded-lg object-contain" src={answerAsset.url} alt="Happy characters celebrating love" />
          <h1 className="mt-6 text-4xl font-semibold">I knew it! 😍</h1>
          {p.sender && <p className="mt-4 text-lg text-muted-foreground">With love, {p.sender}</p>}
          <Button variant="outline" className="mt-8" onClick={() => { setState("question"); setNoCount(0); }}><RotateCcw />Replay</Button>
        </>}
      </div>
    </section>
  );
}