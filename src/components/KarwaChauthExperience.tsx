import { useEffect, useRef, useState } from "react";
import { ArrowRight, Heart, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WrittenLetter } from "@/components/ProposalMoments";
import { celebrate } from "@/lib/celebration";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import { karwaMedia } from "@/lib/karwa-media";

const VOWS = [
  "Har subah tumhari muskaan se shuru ho",
  "Har mushkil mein tumhara haath thaamenge",
  "Tumhari khushi meri sabse badi dua",
  "Har chaand raat tumhare saath",
  "Ladaai ho, par maafi pehle meri",
  "Budhaape tak tumhe hasaate rahenge",
  "Saat janam — sirf tum",
];

function Glows() {
  const [dots, setDots] = useState<{ l: number; t: number; s: number; d: number }[]>([]);
  useEffect(() => { setDots(Array.from({ length: 22 }, () => ({ l: Math.random() * 100, t: 40 + Math.random() * 60, s: 3 + Math.random() * 6, d: Math.random() * 8 }))); }, []);
  return <div aria-hidden className="karwa-glows">{dots.map((g, i) => <span key={i} style={{ left: `${g.l}%`, top: `${g.t}%`, width: g.s, height: g.s, animationDelay: `${g.d}s` }} />)}</div>;
}

export function KarwaChauthExperience(p: ExperienceProps) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [vows, setVows] = useState(0);
  const [slide, setSlide] = useState(0);
  const [muted, setMuted] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const photos = p.photos?.length ? p.photos : karwaMedia.demoPhotos;
  const partner = photos[0]!;

  useEffect(() => {
    const a = new Audio(p.audioUrl || karwaMedia.song); a.loop = true; a.volume = 0.5; audio.current = a;
    return () => { a.pause(); a.removeAttribute("src"); a.load(); audio.current = null; };
  }, [p.audioUrl]);
  useEffect(() => { if (audio.current) audio.current.muted = muted; }, [muted]);
  useEffect(() => {
    if (step !== 3) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % photos.length), 3800);
    return () => window.clearInterval(t);
  }, [step, photos.length]);
  useEffect(() => {
    if (step !== 4) return;
    setVows(0);
    const t = window.setInterval(() => setVows((v) => { if (v >= VOWS.length) { window.clearInterval(t); return v; } return v + 1; }), 900);
    return () => window.clearInterval(t);
  }, [step]);
  useEffect(() => { if (step === 5) celebrate(true); }, [step]);

  const begin = () => { audio.current?.play().catch(() => {}); setStep(1); };
  const next = () => setStep((s) => s + 1);
  const name = p.recipient || "Meri Jaan";
  const from = p.sender || "Tumhara";

  return (
    <section className="karwa-experience">
      <Glows />
      {step > 0 && <button type="button" className="karwa-mute" aria-label={muted ? "Unmute music" : "Mute music"} onClick={() => setMuted((m) => !m)}>{muted ? <VolumeX /> : <Volume2 />}</button>}
      <main key={step} className="karwa-stage">
        {step === 0 && <>
          <div className="karwa-bg karwa-kenburns" style={{ backgroundImage: `url(${karwaMedia.moon})` }} />
          <div className="karwa-content">
            <p className="karwa-eyebrow">Karwa Chauth · Ek chaand raat</p>
            <h1 className="karwa-title">{name}<span>ye raat sirf tumhare liye</span></h1>
            <Button variant="hero" size="lg" onClick={begin}>Chaand ka intezaar khatam karo <ArrowRight /></Button>
            <p className="karwa-hint">Sound on rakhiye 🎶</p>
          </div>
        </>}

        {step === 1 && <div className="karwa-content">
          <p className="karwa-eyebrow">Chalni ki rasm</p>
          <h2 className="karwa-heading">{revealed ? <>Pehle chaand dekha…<span>phir mera chaand, {name}</span></> : <>Chalni uthao<span>aur chaand ko dekho</span></>}</h2>
          <button type="button" className={`karwa-sieve ${revealed ? "is-revealed" : ""}`} onClick={() => setRevealed(true)} aria-label="Look through the sieve">
            <img src={karwaMedia.moon} alt="Full moon through the sieve" className="karwa-sieve-moon" />
            <img src={partner} alt={`${name}`} className="karwa-sieve-face" />
            <span className="karwa-sieve-mesh" aria-hidden />
            <span className="karwa-sieve-rim" aria-hidden />
          </button>
          {revealed ? <Button variant="hero" onClick={next}>Aage <ArrowRight /></Button> : <p className="karwa-hint">Chalni par tap karo</p>}
        </div>}

        {step === 2 && <>
          <div className="karwa-bg karwa-kenburns" style={{ backgroundImage: `url(${karwaMedia.thali})` }} />
          <span className="karwa-flame karwa-flame-a" aria-hidden /><span className="karwa-flame karwa-flame-b" aria-hidden />
          <div className="karwa-content karwa-content-low">
            <p className="karwa-eyebrow">Pooja ki thaali</p>
            <h2 className="karwa-heading">{p.headline || "Tumhari lambi umar ki dua"}<span>har diye mein tum ho</span></h2>
            <Button variant="hero" onClick={next}>Hamari yaadein <ArrowRight /></Button>
          </div>
        </>}

        {step === 3 && <div className="karwa-content">
          <p className="karwa-eyebrow">Hamari yaadein</p>
          <div className="karwa-gallery">
            {photos.map((src, i) => <img key={src + i} src={src} alt={`Memory ${i + 1}`} className={i === slide ? "is-active" : ""} />)}
          </div>
          <div className="karwa-dots">{photos.map((_, i) => <button key={i} type="button" aria-label={`Photo ${i + 1}`} className={i === slide ? "is-active" : ""} onClick={() => setSlide(i)} />)}</div>
          <Button variant="hero" onClick={next}>Saat vaade <ArrowRight /></Button>
        </div>}

        {step === 4 && <>
          <div className="karwa-bg karwa-bg-dim" style={{ backgroundImage: `url(${karwaMedia.mehendi})` }} />
          <div className="karwa-content">
            <p className="karwa-eyebrow">Saat janam ke</p>
            <h2 className="karwa-heading">Saat vaade<span>sirf tumse</span></h2>
            <ol className="karwa-vows">{VOWS.slice(0, vows).map((v, i) => <li key={v}><b>{i + 1}</b>{v}</li>)}</ol>
            {vows >= VOWS.length && <Button variant="hero" onClick={next}>Ek chitthi tumhare liye <Heart /></Button>}
          </div>
        </>}

        {step === 5 && <>
          <div className="karwa-bg karwa-bg-dim karwa-kenburns" style={{ backgroundImage: `url(${photos[1] ?? karwaMedia.couple2})` }} />
          <div className="karwa-content">
            <article className="karwa-letter">
              <p className="karwa-letter-greet">Dear {name},</p>
              <WrittenLetter text={p.message || "Aaj tumne mere liye pura din vrat rakha… bina paani, bina khaane. Main bas itna kehna chahta hoon — tum meri har dua ka jawaab ho. Chaand toh roz aata hai, par mera chaand sirf tum ho. Happy Karwa Chauth, meri jaan."} />
              <p className="karwa-letter-sign">Hamesha tumhara,<span>{from}</span></p>
            </article>
            <Button variant="glass" onClick={() => { setRevealed(false); setSlide(0); setStep(1); }}><RotateCcw /> Phir se dekho</Button>
          </div>
        </>}
      </main>
    </section>
  );
}
