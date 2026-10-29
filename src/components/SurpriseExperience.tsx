import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Gift, Heart, Music, Pause, RotateCcw } from "lucide-react";
import { Petals } from "@/components/Petals";
import { Button } from "@/components/ui/button";
import { MusicBox } from "@/lib/music";
import { ProposalExperience } from "@/components/ProposalExperience";
import { LoveExperience, BirthdayExperience, GiftExperience } from "@/components/UploadedExperiences";
import { KarwaChauthExperience } from "@/components/KarwaChauthExperience";
import { DiwaliExperience } from "@/components/DiwaliExperience";
import { uploadedExperienceKind } from "@/lib/uploaded-templates";
import { newTemplateKind } from "@/lib/new-templates";
import { SweetBirthdayExperience, ApologyExperience, SecretBirthdayExperience } from "@/components/NewExperiences";
import { GardenExperience, HeartExperience } from "@/components/CanvasExperiences";
import type { ProposalConfig } from "@/lib/proposal";

export type ExperienceProps = {
  category: string;
  recipient: string;
  sender: string;
  headline: string;
  message: string;
  cover: string;
  photos?: string[];
  proposalConfig?: ProposalConfig;
  audioUrl?: string | undefined;
  demo?: boolean;
};

type Kind = "birthday" | "proposal" | "love" | "celebrate";

export function experienceKind(category: string): Kind {
  const c = category.toLowerCase();
  if (c.includes("birthday")) return "birthday";
  if (c.includes("proposal") || c.includes("wedding")) return "proposal";
  if (c.includes("love") || c.includes("anniversary")) return "love";
  return "celebrate";
}

const NO_LINES = ["Pakka? 🥺", "Ek baar aur socho 😢", "Dil toot jayega 💔", "Galat button hai 😜", "Try again 🙈", "Yes dabao na 😍"];

function Confetti() {
  const [bits, setBits] = useState<{ l: number; d: number; c: string; s: number }[]>([]);
  useEffect(() => {
    setBits(Array.from({ length: 40 }, () => ({ l: Math.random() * 100, d: Math.random() * 2, s: 12 + Math.random() * 16, c: ["🎉", "✨", "💖", "🎊", "⭐"][Math.floor(Math.random() * 5)]! })));
  }, []);
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">{bits.map((b, i) => <span key={i} className="absolute top-0" style={{ left: `${b.l}%`, fontSize: b.s, animation: `fall 3.5s ease-in ${b.d}s forwards` }}>{b.c}</span>)}</div>;
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[78vh] w-full animate-rise flex-col items-center justify-center text-center">{children}</div>;
}

export function SurpriseExperience(p: ExperienceProps) {
  const kind = uploadedExperienceKind(p.category);
  if (kind === "proposal") return <ProposalExperience {...p} />;
  if (kind === "birthday") return <BirthdayExperience {...p} />;
  if (kind === "love") return <LoveExperience {...p} />;
  if (kind === "gift") return <GiftExperience {...p} />;
  if (kind === "karwa") return <KarwaChauthExperience {...p} />;
  if (kind === "diwali") return <DiwaliExperience {...p} />;
  const extra = newTemplateKind(p.category);
  const original = extra ? ({ sweet: "sweet-birthday", apology: "apology", secret: "secret-birthday", garden: "garden", heart: "heart-universe" } as const)[extra] : null;
  if (original) return (
    <iframe
      src={`/templates-src/${original}/index.html`}
      title={p.category}
      className="fixed inset-0 z-40 h-[100dvh] w-screen border-0"
      allow="autoplay; fullscreen"
      sandbox="allow-scripts allow-same-origin"
    />
  );
  return experienceKind(p.category) === "proposal" ? <ProposalExperience {...p} /> : <ClassicExperience {...p} />;
}

function ClassicExperience(p: ExperienceProps) {
  const kind = experienceKind(p.category);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const music = useRef<MusicBox | null>(null);
  useEffect(() => () => music.current?.stop(), []);

  const toggleMusic = (force?: boolean) => {
    if (!music.current) music.current = new MusicBox(kind === "birthday" ? "birthday" : kind === "celebrate" ? "festive" : "romance");
    const next = force ?? !playing;
    if (next) music.current.start(); else music.current.stop();
    setPlaying(next);
  };
  const next = () => setStep((s) => s + 1);
  const photos = p.photos?.length ? p.photos : [p.cover];
  const party = () => { setCelebrate(true); setTimeout(() => setCelebrate(false), 4000); next(); };

  const intro = <Screen key="intro">
      <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Ek surprise sirf aapke liye</p>
      <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">Hey <span className="text-rose-gradient">{p.recipient}</span> 💌</h1>
      <button aria-label="Open surprise" onClick={() => { toggleMusic(true); next(); }} className="clay mt-10 grid h-40 w-40 place-items-center animate-wobble">
        <Gift className="h-20 w-20 text-primary" />
      </button>
      <p className="mt-6 text-muted-foreground">Gift par tap karein 🎁 (sound on rakhein)</p>
    </Screen>;
  const memories = <Memories key="mem" photos={photos} onNext={next} />;
  const letter = <Screen key="letter">
      <div className="clay w-full max-w-lg p-8 text-left">
        <Heart className="mx-auto mb-4 h-8 w-8 animate-heartbeat fill-primary text-primary" />
        <h2 className="text-center font-display text-3xl">{p.headline || "You mean the world to me"}</h2>
        <Typewriter text={p.message || "Har pal tumhare saath ek celebration hai."} />
      </div>
      <Button variant="hero" size="lg" className="mt-8" onClick={next}>Aage dekho <ChevronRight /></Button>
    </Screen>;
  const finale = <Screen key="end">
      <img src={p.cover} alt="Surprise" className="clay aspect-[4/3] w-full max-w-sm object-cover" />
      {kind === "proposal" && <p className="mt-6 font-display text-3xl">She said YES! 💍💖</p>}
      <p className="mt-6 font-script text-5xl text-primary">With love, {p.sender}</p>
      <p className="mt-3 text-muted-foreground">Forever & Always 💖</p>
      <Button variant="outline" className="mt-8" onClick={() => setStep(0)}><RotateCcw />Replay</Button>
    </Screen>;
  const moment = <Interactive key="moment" kind={kind} recipient={p.recipient} onDone={party} />;

  const screens: React.ReactNode[] = kind === "proposal"
    ? [intro, memories, letter, <RingReveal key="ring" onNext={next} />, moment, finale]
    : [intro, moment, memories, letter, finale];

  return (
    <section className="relative min-h-screen overflow-hidden bg-night px-5 py-10">
      <Petals count={20} />
      {celebrate && <Confetti />}
      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1.5">{screens.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "w-8 bg-primary" : "w-4 bg-primary/20"}`} />)}</div>
          <div className="flex gap-2">
            {step > 0 && <Button size="icon" variant="glass" aria-label="Back" onClick={() => setStep(step - 1)}><ChevronLeft /></Button>}
            <Button size="icon" variant="glass" aria-label={playing ? "Pause music" : "Play music"} onClick={() => toggleMusic()}>{playing ? <Pause /> : <Music />}</Button>
          </div>
        </div>
        {screens[step]}
      </div>
    </section>
  );
}

function RingReveal({ onNext }: { onNext: () => void }) {
  const [open, setOpen] = useState(false);
  return <Screen>
    <h2 className="font-display text-4xl">Ek chhoti si cheez... 💝</h2>
    <p className="mt-3 text-muted-foreground">{open ? "Ye sirf tumhare liye hai" : "Box par tap karke kholo"}</p>
    <button aria-label="Open ring box" onClick={() => setOpen(true)} className={`clay mt-10 grid h-44 w-44 place-items-center transition-transform duration-700 ${open ? "scale-110" : "animate-wobble"}`}>
      <span className={`text-7xl ${open ? "animate-heartbeat" : ""}`}>{open ? "💍" : "🎁"}</span>
    </button>
    {open && <Button variant="hero" size="lg" className="mt-10 animate-rise" onClick={onNext}>Ek sawaal hai... <ChevronRight /></Button>}
  </Screen>;
}

function Interactive({ kind, recipient, onDone }: { kind: Kind; recipient: string; onDone: () => void }) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const [candles, setCandles] = useState([true, true, true]);
  const [opened, setOpened] = useState(false);

  if (kind === "birthday") {
    const left = candles.filter(Boolean).length;
    return <Screen>
      <h2 className="font-display text-4xl">Happy Birthday {recipient}! 🎂</h2>
      <p className="mt-3 text-muted-foreground">Candles par tap karke wish karo aur bujhao</p>
      <div className="mt-10 flex flex-col items-center">
        <div className="flex gap-6">{candles.map((on, i) => <button key={i} aria-label={`Candle ${i + 1}`} onClick={() => { const c = [...candles]; c[i] = false; setCandles(c); if (c.every((x) => !x)) setTimeout(onDone, 700); }} className="flex flex-col items-center">
          <span className={`text-3xl transition-opacity ${on ? "animate-heartbeat" : "opacity-0"}`}>🔥</span>
          <span className="h-14 w-3 rounded-full bg-gold-gradient" />
        </button>)}</div>
        <div className="clay -mt-1 h-24 w-64 bg-rose-gradient" />
        <div className="clay h-6 w-72" />
      </div>
      <p className="mt-6 text-sm text-primary">{left ? `${left} candle baaki` : "Wish poori hogi ✨"}</p>
    </Screen>;
  }

  if (kind === "celebrate") {
    return <Screen>
      <h2 className="font-display text-4xl">Tumhare liye ek letter ✉️</h2>
      <button aria-label="Open envelope" onClick={() => { setOpened(true); setTimeout(onDone, 900); }} className={`clay mt-10 grid h-44 w-64 place-items-center text-7xl transition-transform ${opened ? "scale-110" : "animate-wobble"}`}>{opened ? "💌" : "✉️"}</button>
      <p className="mt-6 text-muted-foreground">Envelope kholne ke liye tap karein</p>
    </Screen>;
  }

  const question = kind === "proposal" ? "Will you marry me? 💍" : "Do you love me? 🥰";
  return <Screen>
    {kind === "proposal" && <div className="mb-6 text-7xl animate-heartbeat">💍</div>}
    <h2 className="font-display text-4xl md:text-5xl">{recipient}, {question}</h2>
    <p className="mt-4 h-6 text-primary">{noCount > 0 ? NO_LINES[(noCount - 1) % NO_LINES.length] : ""}</p>
    <div className="relative mt-8 flex h-40 w-full items-start justify-center gap-6">
      <Button variant="hero" size="lg" style={{ transform: `scale(${1 + noCount * 0.15})` }} onClick={onDone}>Yes 💖</Button>
      <Button variant="outline" size="lg" style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)`, transition: "transform .25s" }}
        onMouseEnter={() => { setNoCount((n) => n + 1); setNoPos({ x: (Math.random() - 0.5) * 240, y: Math.random() * 110 }); }}
        onClick={() => { setNoCount((n) => n + 1); setNoPos({ x: (Math.random() - 0.5) * 240, y: Math.random() * 110 }); }}>No 🙈</Button>
    </div>
  </Screen>;
}

function Memories({ photos, onNext }: { photos: string[]; onNext: () => void }) {
  const [i, setI] = useState(0);
  return <Screen>
    <h2 className="font-display text-4xl">Hamari yaadein 📸</h2>
    <div className="relative mt-8 w-full max-w-sm">
      {photos.map((src, k) => <img key={src + k} src={src} alt={`Memory ${k + 1}`} className={`clay aspect-[3/4] w-full object-cover transition-all duration-500 ${k === i ? "relative rotate-0 opacity-100" : "absolute inset-0 rotate-6 opacity-0"}`} />)}
    </div>
    <div className="mt-6 flex items-center gap-3">
      {photos.length > 1 && <Button size="icon" variant="glass" aria-label="Previous photo" onClick={() => setI((i - 1 + photos.length) % photos.length)}><ChevronLeft /></Button>}
      <span className="text-sm text-muted-foreground">{i + 1} / {photos.length}</span>
      {photos.length > 1 && <Button size="icon" variant="glass" aria-label="Next photo" onClick={() => setI((i + 1) % photos.length)}><ChevronRight /></Button>}
    </div>
    <Button variant="hero" size="lg" className="mt-6" onClick={onNext}>Ek letter bhi hai <ChevronRight /></Button>
  </Screen>;
}

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); const t = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(t), x) : x + 1)), 35); return () => clearInterval(t); }, [text]);
  return <p className="mt-5 min-h-24 whitespace-pre-wrap break-words text-lg leading-relaxed">{text.slice(0, n)}<span className="animate-pulse text-primary">|</span></p>;
}
