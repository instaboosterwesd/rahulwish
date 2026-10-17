import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Music2, Pause, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import garden from "@/assets/proposal-garden.jpg";
import ring from "@/assets/proposal-ring.jpg";

const chapters = ["A little secret", "Our little world", "From my heart", "A promise", "One question", "Our forever"];

export function ProposalExperience({ recipient, sender, headline, message, photos, cover }: ExperienceProps) {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [thinking, setThinking] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const memories = photos?.length ? photos : [cover];

  useEffect(() => {
    const track = new Audio("/audio/our-forever.mp3");
    track.loop = true;
    track.volume = 0.55;
    audio.current = track;
    return () => { track.pause(); track.removeAttribute("src"); track.load(); audio.current = null; };
  }, []);

  const play = async () => {
    if (!audio.current) return;
    try { await audio.current.play(); setPlaying(true); setAudioFailed(false); }
    catch { setPlaying(false); setAudioFailed(true); }
  };
  const toggleMusic = () => {
    if (playing) { audio.current?.pause(); setPlaying(false); }
    else void play();
  };
  const next = () => setStep((current) => Math.min(current + 1, chapters.length - 1));
  const replay = () => { setStep(0); setOpened(false); setThinking(false); setPhoto(0); if (audio.current) audio.current.currentTime = 0; };

  return (
    <section className={`proposal-experience ${step === 5 ? "proposal-celebrating" : ""}`} aria-label="Your proposal surprise">
      <img src={garden} width={1024} height={1536} alt="Roses framing a lakeside garden at sunset" className="proposal-backdrop" />
      <div className="proposal-veil" aria-hidden="true" />
      <header className="proposal-header">
        <span className="proposal-wordmark"><Heart size={15} /> always4you</span>
        <div className="flex items-center gap-2">
          {step > 0 && <Button variant="ghost" size="icon" title="Previous chapter" aria-label="Previous chapter" onClick={() => setStep(step - 1)}><ArrowLeft /></Button>}
          <Button variant="glass" size="icon" title={playing ? "Pause Our Forever" : "Play Our Forever"} aria-label={playing ? "Pause music" : "Play music"} onClick={toggleMusic}>{playing ? <Pause /> : <Music2 />}</Button>
        </div>
      </header>

      <main className="proposal-stage" key={step}>
        <p className="proposal-eyebrow">{chapters[step]} <span aria-hidden="true">—</span> {String(step + 1).padStart(2, "0")}</p>

        {step === 0 && <>
          <h1 className="proposal-title">Of all the people,<br /><span>it was always you.</span></h1>
          <p className="proposal-subtitle">{recipient}, there’s something my heart wants to say.</p>
          <Button variant="ghost" className="proposal-envelope" aria-label="Open your letter" onClick={() => { void play(); next(); }}>
            <span className="proposal-envelope-paper">For {recipient}<span className="font-script">with all my love</span></span>
            <span className="proposal-envelope-fold" />
            <span className="proposal-seal"><Heart size={20} /></span>
          </Button>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={() => { void play(); next(); }}>Open my heart <ArrowRight /></Button>
          <p className="proposal-signature">a little something, from {sender}</p>
        </>}

        {step === 1 && <>
          <h2 className="proposal-title">My favourite place?<br /><span>Right beside you.</span></h2>
          <div className="proposal-photo-stack">
            <div className="proposal-photo-under" aria-hidden="true" />
            <figure className="proposal-polaroid">
              <img src={memories[photo]} alt={`Our memory ${photo + 1}`} width={1024} height={1024} />
              <figcaption>you & me. my favourite story.</figcaption>
            </figure>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="glass" size="icon" disabled={memories.length < 2} aria-label="Previous memory" onClick={() => setPhoto((photo + memories.length - 1) % memories.length)}><ArrowLeft /></Button>
            <span className="proposal-counter">{photo + 1} / {memories.length}</span>
            <Button variant="glass" size="icon" disabled={memories.length < 2} aria-label="Next memory" onClick={() => setPhoto((photo + 1) % memories.length)}><ArrowRight /></Button>
          </div>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>A letter for you <ArrowRight /></Button>
        </>}

        {step === 2 && <>
          <h2 className="proposal-title">A thousand feelings.<br /><span>One little letter.</span></h2>
          <article className="proposal-letter">
            <p className="proposal-letter-greeting">My dearest {recipient},</p>
            <h3>{headline || "You are my favourite forever."}</h3>
            <p className="proposal-letter-message">{message || "Tumhare saath har chhota pal bhi khaas lagta hai. I don’t need a perfect life. I just want a life with you."}</p>
            <p className="proposal-letter-sign">Always yours,<br /><span>{sender}</span></p>
          </article>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>There’s one more thing <ArrowRight /></Button>
        </>}

        {step === 3 && <>
          <h2 className="proposal-title">Not just a ring.<br /><span>A little forever.</span></h2>
          <div className={`proposal-ring-reveal ${opened ? "is-open" : ""}`}>
            <img src={ring} alt="A diamond engagement ring in a velvet box surrounded by roses" width={1024} height={1024} loading="lazy" />
            {!opened && <Button variant="secondary" className="proposal-ring-cover" aria-label="Reveal the ring" onClick={() => setOpened(true)}><span className="proposal-ring-monogram">For you</span><span className="flex items-center gap-2 text-sm">A promise inside <Sparkles size={16} /></span></Button>}
          </div>
          <p className="proposal-subtitle">{opened ? "Every tomorrow. Every adventure. With you." : "Some promises deserve a beautiful beginning."}</p>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={opened ? next : () => setOpened(true)}>{opened ? "Can I ask you something?" : "Unwrap my promise"} <ArrowRight /></Button>
        </>}

        {step === 4 && <>
          <div className="proposal-question-mark" aria-hidden="true"><Heart size={32} /></div>
          <p className="proposal-subtitle">{recipient}, my today and all my tomorrows…</p>
          <h2 className="proposal-title">Will you<br /><span>marry me?</span></h2>
          <p className="proposal-subtitle">I choose you. In every lifetime.</p>
          <div className="proposal-answer-row">
            <Button variant="hero" size="lg" onClick={next}>Yes, a thousand times <Heart /></Button>
            <Button variant="glass" size="lg" onClick={() => setThinking(true)}>Let me think</Button>
          </div>
          {thinking && <p className="proposal-reassurance" role="status">Take your time. Your answer is yours, and you mean the world to me.</p>}
        </>}

        {step === 5 && <>
          <div className="proposal-question-mark" aria-hidden="true"><Check size={32} /></div>
          <h2 className="proposal-title">And just like that,<br /><span>our forever begins.</span></h2>
          <img src={ring} alt="Our forever promise" width={1024} height={1024} loading="lazy" className="proposal-finale-photo" />
          <p className="proposal-couple">{recipient} <Heart size={20} /> {sender}</p>
          <p className="proposal-subtitle">One yes. A lifetime of us.</p>
          <Button variant="glass" className="proposal-cta" onClick={replay}><RotateCcw /> Relive our story</Button>
        </>}
      </main>

      <footer className="proposal-footer">
        <nav aria-label="Proposal chapters" className="proposal-progress">{chapters.map((chapter, i) => <Button key={chapter} variant="ghost" aria-label={`Chapter ${i + 1}: ${chapter}`} aria-current={i === step ? "step" : undefined} disabled={i > step} onClick={() => setStep(i)} className={`proposal-progress-dot ${i <= step ? "is-complete" : ""}`}><span /></Button>)}</nav>
        <span className="proposal-track">{audioFailed ? "Music couldn’t play — tap music to retry" : playing ? "♪ Our Forever · original piano" : "Made with a heart full of you"}</span>
      </footer>
    </section>
  );
}