import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WrittenLetter } from "@/components/ProposalMoments";
import { celebrate } from "@/lib/celebration";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import { diwaliMedia, diwaliQuiz } from "@/lib/diwali";

const STEPS = ["Shuruaat", "Diya", "Sawaal", "Yaadein", "Shubhkaamna"];
const BACKGROUNDS = [diwaliMedia.cover, diwaliMedia.diya, diwaliMedia.sweets, diwaliMedia.cover, diwaliMedia.fireworks];

export function DiwaliExperience(p: ExperienceProps) {
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(false);
  const [slide, setSlide] = useState(0);
  const [muted, setMuted] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const photos = p.photos?.length ? p.photos : diwaliMedia.demoPhotos;
  const questions = p.proposalConfig?.quiz?.length ? p.proposalConfig.quiz : diwaliQuiz;
  const q = questions[qi];
  const name = p.recipient || "Meri Jaan";
  const from = p.sender || "Tumhara apna";

  useEffect(() => {
    const a = new Audio(p.audioUrl || diwaliMedia.song); a.loop = true; a.volume = 0.5; audio.current = a;
    return () => { a.pause(); a.removeAttribute("src"); a.load(); audio.current = null; };
  }, [p.audioUrl]);
  useEffect(() => { if (audio.current) audio.current.muted = muted; }, [muted]);
  useEffect(() => {
    if (step !== 3) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % photos.length), 3600);
    return () => window.clearInterval(t);
  }, [step, photos.length]);
  useEffect(() => { if (step === 4) celebrate(true); }, [step]);

  const next = () => setStep((s) => s + 1);
  const restart = () => { setLit(false); setSlide(0); setQi(0); setPicked(null); setScore(0); setStep(1); };

  return (
    <section className="karwa-experience">
      {BACKGROUNDS.map((bg, i) => (
        <div key={i} aria-hidden className={`karwa-bg ${i === step ? "is-active" : ""}`} style={{ backgroundImage: `url(${bg})` }} />
      ))}
      <div className="karwa-shade" aria-hidden />

      {step > 0 && (
        <header className="karwa-top">
          <div className="karwa-progress" aria-label={`Step ${step} of ${STEPS.length - 1}`}>
            {STEPS.slice(1).map((s, i) => <span key={s} className={i + 1 <= step ? "is-done" : ""} />)}
          </div>
          <button type="button" className="karwa-mute" aria-label={muted ? "Unmute music" : "Mute music"} onClick={() => setMuted((m) => !m)}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
        </header>
      )}

      <main key={step} className="karwa-stage">
        {step === 0 && (
          <div className="karwa-content">
            <p className="karwa-eyebrow">Shubh Deepavali</p>
            <h1 className="karwa-title">{name}<span>is Diwali, roshni tumhare naam</span></h1>
            <Button variant="hero" size="lg" onClick={() => { audio.current?.play().catch(() => {}); next(); }}>Surprise kholo <ArrowRight /></Button>
            <p className="karwa-hint">Sound on rakhiye 🎶</p>
          </div>
        )}

        {step === 1 && (
          <div className="karwa-content">
            <p className="karwa-eyebrow">Pehla diya</p>
            <h2 className="karwa-heading">{lit ? <>Ghar roshan ho gaya<span>tumhari tarah</span></> : <>Ek diya jalao<span>hamare liye</span></>}</h2>
            <button type="button" className={`diwali-diya ${lit ? "is-lit" : ""}`} onClick={() => { setLit(true); celebrate(false); }} aria-label="Light the diya">
              <img src={diwaliMedia.diya} alt="Clay diya" width={896} height={1152} />
              <span className="diwali-flame" aria-hidden />
            </button>
            {lit ? <Button variant="hero" onClick={next}>Aage chalo <ArrowRight /></Button> : <p className="karwa-hint">Diya par tap karo 🪔</p>}
          </div>
        )}

        {step === 2 && q && (
          <div className="karwa-content">
            <div className="karwa-card">
              <p className="karwa-eyebrow">Sawaal {qi + 1} / {questions.length}</p>
              <h2 className="karwa-question">{q.question}</h2>
              <div className="karwa-quiz">
                {q.options.map((o, i) => (
                  <button key={o + i} type="button" disabled={picked !== null}
                    onClick={() => { setPicked(i); if (i === q.answer) setScore((s) => s + 1); }}
                    className={`karwa-quiz-option ${picked !== null && i === q.answer ? "is-right" : picked === i ? "is-wrong" : ""}`}>
                    <span>{o}</span>{picked !== null && i === q.answer && <Check size={18} />}
                  </button>
                ))}
              </div>
              <p role="status" className="karwa-hint karwa-status">{picked === null ? "" : picked === q.answer ? "Ekdum sahi! ✨" : "Koi baat nahi — sahi jawaab chamak raha hai 🪔"}</p>
              <Button variant="hero" className="w-full" disabled={picked === null} onClick={() => { if (qi < questions.length - 1) { setQi(qi + 1); setPicked(null); } else next(); }}>
                {qi < questions.length - 1 ? "Agla sawaal" : `Score ${score}/${questions.length} · Yaadein dekho`} <ArrowRight />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="karwa-content">
            <p className="karwa-eyebrow">Roshan yaadein</p>
            <div className="karwa-gallery">
              {photos.map((src, i) => <img key={src + i} src={src} alt={`Memory ${i + 1}`} loading={i === 0 ? undefined : "lazy"} className={i === slide ? "is-active" : ""} />)}
            </div>
            <div className="karwa-dots">{photos.map((_, i) => <button key={i} type="button" aria-label={`Photo ${i + 1}`} className={i === slide ? "is-active" : ""} onClick={() => setSlide(i)} />)}</div>
            <Button variant="hero" onClick={next}>Ek chitthi <Sparkles /></Button>
          </div>
        )}

        {step === 4 && (
          <div className="karwa-content">
            <article className="karwa-letter">
              <p className="karwa-letter-greet">Dear {name},</p>
              <WrittenLetter text={p.message || "Har saal diye jalte hain, par mere ghar ki asli roshni tum ho. Is Diwali bas yahi dua hai — tumhari zindagi khushiyon, mithaas aur pyaar se jagmagati rahe. Happy Diwali!"} />
              <p className="karwa-letter-sign">Dher saara pyaar,<span>{from}</span></p>
            </article>
            <Button variant="glass" onClick={restart}><RotateCcw /> Phir se dekho</Button>
          </div>
        )}
      </main>
    </section>
  );
}
