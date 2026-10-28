import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Heart, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WrittenLetter } from "@/components/ProposalMoments";
import { celebrate } from "@/lib/celebration";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import { karwaMedia } from "@/lib/karwa-media";
import { karwaQuiz } from "@/lib/karwa";

const VOWS = [
  "Har subah tumhari muskaan se shuru ho",
  "Har mushkil mein tumhara haath thaamenge",
  "Tumhari khushi meri sabse badi dua",
  "Har chaand raat tumhare saath",
  "Ladaai ho, par maafi pehle meri",
  "Budhaape tak tumhe hasaate rahenge",
  "Saat janam — sirf tum",
];

function BgVideo({ src, dim }: { src: string; dim?: boolean }) {
  return <div className={`karwa-bg ${dim ? "karwa-bg-dim" : ""}`}><video className="karwa-video" src={src} autoPlay muted loop playsInline /></div>;
}

export function KarwaChauthExperience(p: ExperienceProps) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [vows, setVows] = useState(0);
  const [slide, setSlide] = useState(0);
  const [muted, setMuted] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const photos = p.photos?.length ? p.photos : karwaMedia.demoPhotos;
  const partner = photos[0]!;
  const questions = p.proposalConfig?.quiz?.length ? p.proposalConfig.quiz : karwaQuiz;
  const q = questions[qi];

  useEffect(() => {
    const a = new Audio(p.audioUrl || karwaMedia.song); a.loop = true; a.volume = 0.55; audio.current = a;
    return () => { a.pause(); a.removeAttribute("src"); a.load(); audio.current = null; };
  }, [p.audioUrl]);
  useEffect(() => { if (audio.current) audio.current.muted = muted; }, [muted]);
  useEffect(() => {
    if (step !== 4) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % photos.length), 3800);
    return () => window.clearInterval(t);
  }, [step, photos.length]);
  useEffect(() => {
    if (step !== 5) return;
    setVows(0);
    const t = window.setInterval(() => setVows((v) => { if (v >= VOWS.length) { window.clearInterval(t); return v; } return v + 1; }), 900);
    return () => window.clearInterval(t);
  }, [step]);
  useEffect(() => { if (step === 6) celebrate(true); }, [step]);

  const begin = () => { audio.current?.play().catch(() => {}); setStep(1); };
  const next = () => setStep((s) => s + 1);
  const name = p.recipient || "Meri Jaan";
  const from = p.sender || "Tumhara";
  const restart = () => { setRevealed(false); setSlide(0); setQi(0); setPicked(null); setScore(0); setStep(1); };

  return (
    <section className="karwa-experience">
      <BgVideo src={karwaMedia.videos.gold} dim />
      {step > 0 && <button type="button" className="karwa-mute" aria-label={muted ? "Unmute music" : "Mute music"} onClick={() => setMuted((m) => !m)}>{muted ? <VolumeX /> : <Volume2 />}</button>}
      <main key={step} className="karwa-stage">
        {step === 0 && <>
          <BgVideo src={karwaMedia.videos.moon} />
          <div className="karwa-content">
            <p className="karwa-eyebrow">Karwa Chauth · Ek chaand raat</p>
            <h1 className="karwa-title">{name}<span>ye raat sirf tumhare liye</span></h1>
            <Button variant="hero" size="lg" onClick={begin}>Surprise kholo <ArrowRight /></Button>
            <p className="karwa-hint">Sound on rakhiye 🎶</p>
          </div>
        </>}

        {step === 1 && <>
          <BgVideo src={karwaMedia.videos.sieve} dim />
          <div className="karwa-content">
            <p className="karwa-eyebrow">Chalni ki rasm</p>
            <h2 className="karwa-heading">{revealed ? <>Pehle chaand dekha…<span>phir mera chaand, {name}</span></> : <>Chalni uthao<span>aur chaand ko dekho</span></>}</h2>
            <button type="button" className={`karwa-sieve ${revealed ? "is-revealed" : ""}`} onClick={() => setRevealed(true)} aria-label="Look through the sieve">
              <img src={karwaMedia.moon} alt="Full moon through the sieve" className="karwa-sieve-moon" />
              <img src={partner} alt={name} className="karwa-sieve-face" />
              <span className="karwa-sieve-mesh" aria-hidden />
              <span className="karwa-sieve-rim" aria-hidden />
            </button>
            {revealed ? <Button variant="hero" onClick={next}>Aage <ArrowRight /></Button> : <p className="karwa-hint">Chalni par tap karo</p>}
          </div>
        </>}

        {step === 2 && q && <div className="karwa-content">
          <p className="karwa-eyebrow">Sawaal {qi + 1} / {questions.length}</p>
          <h2 className="karwa-heading">{q.question}</h2>
          <div className="karwa-quiz">
            {q.options.map((o, i) => <button key={o + i} type="button" disabled={picked !== null} onClick={() => { setPicked(i); if (i === q.answer) setScore((s) => s + 1); }} className={`karwa-quiz-option ${picked === i ? (i === q.answer ? "is-right" : "is-wrong") : ""} ${picked !== null && i === q.answer ? "is-right" : ""}`}>{o}{picked !== null && i === q.answer && <Check size={18} />}</button>)}
          </div>
          {picked !== null && <p role="status" className="karwa-hint">{picked === q.answer ? "Bilkul sahi! 💛" : "Oops… sahi jawaab upar chamak raha hai ✨"}</p>}
          <Button variant="hero" disabled={picked === null} onClick={() => { if (qi < questions.length - 1) { setQi(qi + 1); setPicked(null); } else next(); }}>{qi < questions.length - 1 ? "Agla sawaal" : "Result dekho"} <ArrowRight /></Button>
        </div>}

        {step === 3 && <>
          <div className="karwa-bg karwa-kenburns" style={{ backgroundImage: `url(${karwaMedia.thali})` }} />
          <div className="karwa-content karwa-content-low">
            <p className="karwa-eyebrow">Tumhara score</p>
            <h2 className="karwa-heading">{score} / {questions.length}<span>{score === questions.length ? "Tum mujhe sabse achhe se jaanti ho" : "Har jawaab mein bas pyaar hai"}</span></h2>
            <Button variant="hero" onClick={next}>Hamari yaadein <ArrowRight /></Button>
          </div>
        </>}

        {step === 4 && <div className="karwa-content">
          <p className="karwa-eyebrow">Hamari yaadein</p>
          <div className="karwa-gallery">
            {photos.map((src, i) => <img key={src + i} src={src} alt={`Memory ${i + 1}`} className={i === slide ? "is-active" : ""} />)}
          </div>
          <div className="karwa-dots">{photos.map((_, i) => <button key={i} type="button" aria-label={`Photo ${i + 1}`} className={i === slide ? "is-active" : ""} onClick={() => setSlide(i)} />)}</div>
          <Button variant="hero" onClick={next}>Saat vaade <ArrowRight /></Button>
        </div>}

        {step === 5 && <>
          <div className="karwa-bg karwa-bg-dim" style={{ backgroundImage: `url(${karwaMedia.mehendi})` }} />
          <div className="karwa-content">
            <p className="karwa-eyebrow">Saat janam ke</p>
            <h2 className="karwa-heading">Saat vaade<span>sirf tumse</span></h2>
            <ol className="karwa-vows">{VOWS.slice(0, vows).map((v, i) => <li key={v}><b>{i + 1}</b>{v}</li>)}</ol>
            {vows >= VOWS.length && <Button variant="hero" onClick={next}>Ek chitthi tumhare liye <Heart /></Button>}
          </div>
        </>}

        {step === 6 && <>
          <div className="karwa-bg karwa-bg-dim karwa-kenburns" style={{ backgroundImage: `url(${photos[1] ?? karwaMedia.couple2})` }} />
          <div className="karwa-content">
            <article className="karwa-letter">
              <p className="karwa-letter-greet">Dear {name},</p>
              <WrittenLetter text={p.message || "Aaj tumne mere liye pura din vrat rakha… bina paani, bina khaane. Main bas itna kehna chahta hoon — tum meri har dua ka jawaab ho. Chaand toh roz aata hai, par mera chaand sirf tum ho. Happy Karwa Chauth, meri jaan."} />
              <p className="karwa-letter-sign">Hamesha tumhara,<span>{from}</span></p>
            </article>
            <Button variant="glass" onClick={restart}><RotateCcw /> Phir se dekho</Button>
          </div>
        </>}
      </main>
    </section>
  );
}
