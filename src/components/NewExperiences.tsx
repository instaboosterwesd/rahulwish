import { useEffect, useRef, useState } from "react";
import { ArrowRight, Delete, Pause, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/celebration";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import { apologyMedia, matchesSecretPasscode, DEFAULT_SECRET_PASSCODE, secretMedia, sweetMedia } from "@/lib/new-templates";

/* ───────────────────────── Sweet Birthday ───────────────────────── */

const SWEET_CAPTIONS = [
  { tag: "sweet smile ♡", line: "Pure sunshine & joy ☀️" },
  { tag: "pure energy ✦", line: "Keep shining bright always! ✨" },
  { tag: "forever loved 💖", line: "Deeply loved & cherished!" },
];
const SWEET_WISHES = [
  "May your days be filled with endless laughter & pure sunshine ✨",
  "May all your sweetest dreams, big & small, come true ✨",
  "Surrounded always by genuine love, peace & true happiness ✨",
  "Keep blooming, inspiring and radiating your beautiful spark ✨",
  "Here’s to another fabulous, unforgettable year of being awesome! ✨",
];
const BALLOONS = ["🎈", "💖", "🎈", "🌸", "🎈", "⭐"];

export function SweetBirthdayExperience(p: ExperienceProps) {
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candles, setCandles] = useState([true, true, true]);
  const [popped, setPopped] = useState<number[]>([]);
  const [opened, setOpened] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const name = p.recipient || "Birthday Star";
  const photos = p.photos?.length ? p.photos : sweetMedia.photos;

  useEffect(() => {
    const a = new Audio(p.audioUrl || sweetMedia.song); a.loop = true; a.volume = 0.6; audio.current = a;
    const tick = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    a.addEventListener("timeupdate", tick);
    return () => { a.removeEventListener("timeupdate", tick); a.pause(); a.removeAttribute("src"); a.load(); audio.current = null; };
  }, [p.audioUrl]);

  const toggle = () => {
    const a = audio.current; if (!a) return;
    if (a.paused) { a.play().then(() => setPlaying(true)).catch(() => {}); } else { a.pause(); setPlaying(false); }
  };
  const go = (n: number) => { if (n === 1 && audio.current?.paused) toggle(); setPage(n); };
  const blow = (i: number) => {
    const next = candles.map((c, j) => (j === i ? false : c)); setCandles(next);
    if (next.every((c) => !c)) celebrate(false);
  };
  const lit = candles.some(Boolean);

  return (
    <section className="sweet-experience">
      <div className="sweet-sparkles" aria-hidden>{"✦ ♡ ✧ ♡ ✦ ♡ ✧".split(" ").map((s, i) => <span key={i} style={{ left: `${8 + i * 13}%`, animationDelay: `${i * 0.6}s` }}>{s}</span>)}</div>
      <main key={page} className="sweet-page">
        {page === 0 && <>
          <p className="sweet-eyebrow">🎀 It's your day, shine!</p>
          <h1 className="sweet-title">Happy <span>B I R T H D A Y</span></h1>
          <p className="sweet-name">{name} ♡</p>
          <img src={sweetMedia.cat} alt="Cute cat celebrating a birthday" className="sweet-gif" width={260} height={260} />
          <div className="sweet-player">
            <button type="button" onClick={toggle} aria-label={playing ? "Pause song" : "Play song"}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
            <div className="sweet-track"><span style={{ width: `${progress * 100}%` }} /></div>
            <small>sweet day ♡</small>
          </div>
          <Button variant="hero" size="lg" onClick={() => go(1)}>Cake Time 🎂 <ArrowRight /></Button>
        </>}

        {page === 1 && <>
          <p className="sweet-eyebrow">Make a wish ♡</p>
          <h2 className="sweet-heading">B L O W &nbsp; T H E &nbsp; C A N D L E S</h2>
          <div className="sweet-cake">
            <div className="sweet-candles">{candles.map((on, i) => <button key={i} type="button" aria-label={`Blow candle ${i + 1}`} className={`sweet-candle ${on ? "is-lit" : ""}`} onClick={() => blow(i)}><span className="sweet-flame" /></button>)}</div>
            <img src={sweetMedia.cake} alt="Kawaii birthday cake" width={240} height={240} />
          </div>
          <p className="sweet-copy">{lit ? "Tap each candle to blow it out 🕯️" : "May all your sweetest wishes and dreams come true! ✨"}</p>
          {!lit && <Button variant="hero" onClick={() => go(2)}>Birthday {p.demo ? "Girl" : "Star"} 🌸 <ArrowRight /></Button>}
        </>}

        {page === 2 && <>
          <p className="sweet-eyebrow">Sweet Moments ♡</p>
          <h2 className="sweet-heading">{name.toUpperCase().split("").join(" ")}</h2>
          <p className="sweet-copy">Forever lovely, radiant & cherished ✨</p>
          <div className="sweet-polaroids">
            {photos.slice(0, 3).map((src, i) => <figure key={src + i} className="sweet-polaroid" style={{ ["--r" as string]: `${(i - 1) * 6}deg` }}>
              <img src={src} alt={`Memory ${i + 1}`} loading="lazy" />
              <figcaption><b>{SWEET_CAPTIONS[i % 3]!.tag}</b>{SWEET_CAPTIONS[i % 3]!.line}</figcaption>
            </figure>)}
          </div>
          <Button variant="hero" onClick={() => go(3)}>Balloons 🎈 <ArrowRight /></Button>
        </>}

        {page === 3 && <>
          <p className="sweet-eyebrow">Warmest Blessings ♡</p>
          <h2 className="sweet-heading">BALLOONS & WISHES</h2>
          <div className="sweet-balloons">{BALLOONS.map((b, i) => <button key={i} type="button" aria-label="Pop balloon" className={`sweet-balloon ${popped.includes(i) ? "is-popped" : ""}`} style={{ animationDelay: `${i * 0.3}s` }} onClick={() => { setPopped((x) => [...x, i]); celebrate(true); }}>{popped.includes(i) ? "💥" : b}</button>)}</div>
          <ul className="sweet-wishes">{SWEET_WISHES.map((w) => <li key={w}>♥ {w}</li>)}</ul>
          <img src={sweetMedia.bunny} alt="Cute bunny cheering" className="sweet-gif is-small" width={140} height={140} loading="lazy" />
          <Button variant="hero" onClick={() => go(4)}>Celebration 🎉 <ArrowRight /></Button>
        </>}

        {page === 4 && <>
          <p className="sweet-eyebrow">👑 Happy Birthday Queen ♡</p>
          <h2 className="sweet-heading">C E L E B R A T I O N</h2>
          {!opened ? <>
            <button type="button" className="sweet-gift" onClick={() => { setOpened(true); celebrate(false); }} aria-label="Open your birthday gift">🎁<span>For You ♡</span></button>
            <p className="sweet-copy">✨ Tap the gift box to open your birthday surprise! 🎁</p>
          </> : <div className="sweet-card">
            <p className="sweet-eyebrow">★ QUEEN OF THE DAY ★</p>
            <h3>{name}</h3>
            <p className="sweet-copy">"{p.headline && p.headline !== "Sweet Birthday" ? p.headline : "May your life always be as radiant, joyful, and magical as you make the world feel every single day!"}"</p>
            {p.message && <p className="sweet-letter">{p.message}</p>}
            <img src={sweetMedia.party} alt="Celebration cake" width={160} height={160} loading="lazy" />
            {p.sender && <p className="sweet-from">With love, {p.sender}</p>}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="hero" onClick={() => celebrate(false)}>Fire Again! ✨</Button>
              <Button variant="outline" onClick={() => { setCandles([true, true, true]); setPopped([]); setOpened(false); setPage(0); }}><RotateCcw /> Replay</Button>
            </div>
          </div>}
        </>}
      </main>
    </section>
  );
}

/* ───────────────────────── Apology Card ───────────────────────── */

type ApologyScreen = "ask" | "sure" | "sad" | "begging" | "forgiven";
const BEG_LINES = ["Look at my tears! 🌊😭", "I'll do all your chores! 🧹🥺", "Free snacks & ice cream! 🍦💖", "I'm on my knees! 🙇‍♂️💔", "Have mercy please! 🥺", "Say yes please! 😭❤️"];
const LOVE_WORDS = ["i love you ❤️", "love you ∞", "forever yours 💖", "ilysm 💕", "my whole world 🌎✨", "always & forever 💖", "never letting you go 💕", "you & me forever ∞", "cutie pie 🥰", "my heart is yours ❤️"];

export function ApologyExperience(p: ExperienceProps) {
  const [screen, setScreen] = useState<ApologyScreen>("ask");
  const [beg, setBeg] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rain, setRain] = useState<{ id: number; x: number; d: number; w: string }[]>([]);
  const name = p.recipient || "Cutie";
  const forgive = () => { setScreen("forgiven"); celebrate(true); };
  const dodge = () => { setBeg((b) => b + 1); setOffset({ x: (Math.random() - 0.5) * 170, y: (Math.random() - 0.5) * 130 }); };
  const shower = () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const base = Date.now();
      setRain(Array.from({ length: 36 }, (_, i) => ({ id: base + i, x: Math.random() * 92 + 4, d: Math.random() * 1.2, w: LOVE_WORDS[i % LOVE_WORDS.length]! })));
      window.setTimeout(() => setRain([]), 4200);
    }
    celebrate(true);
  };
  const gif = { ask: apologyMedia.pleading, sure: apologyMedia.corgi, sad: apologyMedia.crying, begging: apologyMedia.begging, forgiven: apologyMedia.love }[screen];

  return (
    <section className={`apology-experience is-${screen}`}>
      <div className="apology-decor" aria-hidden>{(screen === "sad" ? "💧 🌧️ 💧 💧" : screen === "begging" ? "❤️‍🩹 🩹 🥺 ❤️‍🩹" : screen === "forgiven" ? "🎉 💖 ✨ 🥳 🎊" : "✨ ☁️ 🤍 🕊️ ☁️").split(" ").map((s, i) => <span key={i} style={{ left: `${6 + i * 22}%`, animationDelay: `${i * 0.7}s` }}>{s}</span>)}</div>
      {rain.map((r) => <span key={r.id} className="apology-drop" style={{ left: `${r.x}%`, animationDelay: `${r.d}s` }} aria-hidden>{r.w}</span>)}
      <main key={screen} className="apology-card">
        <img src={gif} alt="" width={200} height={200} className="apology-gif" />
        {screen === "ask" && <>
          <p className="apology-eyebrow">{name}, an apology for you 💌</p>
          <h1>Are you still mad at me?</h1>
          <p>I'm really really sorry... Please forgive me? 🥺</p>
          <div className="apology-actions"><Button variant="hero" onClick={() => setScreen("sure")}>No, I forgive you 💜</Button><Button variant="outline" onClick={() => setScreen("sad")}>Yes 😤</Button></div>
        </>}
        {screen === "sure" && <>
          <h1>Are you really sure?</h1>
          <p>Do you truly forgive me from your heart? I promise I will never make you sad again... 🥺💕</p>
          <div className="apology-actions"><Button variant="hero" onClick={forgive}>Yes, I truly forgive you ❤️</Button><Button variant="outline" onClick={() => setScreen("ask")}>I don't know yet... 🤔</Button></div>
        </>}
        {screen === "sad" && <>
          <h1>Please Don't Stay Mad... 😭💔</h1>
          <p>Seeing you upset breaks my whole heart into pieces... I am so deeply sorry! Please forgive me, I can't bear seeing you sad... 🥺💧</p>
          <div className="apology-actions"><Button variant="hero" onClick={forgive}>Okay, I forgive you 🥺💖</Button><Button variant="outline" onClick={() => setScreen("begging")}>Still mad! 😤</Button></div>
        </>}
        {screen === "begging" && <>
          <h1>I'm 10000% Sorry, Please! 😭💔</h1>
          <p>I am literally on my knees begging for your forgiveness... I promise on my life to never make this mistake again. Please forgive your dummy? 🥺🙏❤️‍🩹</p>
          <div className="apology-actions">
            <Button variant="hero" onClick={forgive} style={{ transform: `scale(${Math.min(1.4, 1 + beg * 0.08)})` }}>Okay, I forgive you! Don't cry 🥺❤️</Button>
            <Button variant="outline" onMouseEnter={dodge} onClick={dodge} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>{beg ? BEG_LINES[beg % BEG_LINES.length] : "Still no! 😤"}</Button>
          </div>
        </>}
        {screen === "forgiven" && <>
          <h1>Thank You for Forgiving Me ❤️</h1>
          <p className="apology-message">{p.message || "You mean the absolute world to me. My heart only finds peace when you smile... I promise to cherish you, protect your happiness, and love you endlessly forever and always. 🥺💑✨"}</p>
          {p.sender && <p className="apology-from">— {p.sender}</p>}
          <div className="apology-actions"><Button variant="hero" onClick={shower}>Love You to Infinity ∞ 💖</Button><Button variant="ghost" onClick={() => { setBeg(0); setOffset({ x: 0, y: 0 }); setScreen("ask"); }}><RotateCcw /> Replay</Button></div>
        </>}
      </main>
    </section>
  );
}

/* ───────────────────────── Secret Birthday Gift ───────────────────────── */

type SecretStage = "countdown" | "passcode" | "surprise" | "excited" | "gifts";
const MEMORY_CAPTIONS = ["Waku Waku Cake! 🎂", "Peanuts & Gift 🎁", "Best Friend! 🎈", "Make A Wish 🕯️✨", "Partners in crime 🐶"];
const DEFAULT_LETTER = "Happy birthday to my favourite person! ❤️\n\nI hope this year brings you everything you've been wishing for and so much more. Thank you for making my days happier, my bad days easier, and my life a little more beautiful just by being in it. 🥺💖\n\nI'm so lucky to have you, and I can't wait to make a million more memories with you. Here's to you, your dreams, and all the happiness you deserve.\n\nHappy birthday, my love. I love you more than you know. 🫶🏻🎂❤️";

export function SecretBirthdayExperience(p: ExperienceProps) {
  const [stage, setStage] = useState<SecretStage>("countdown");
  const [secs, setSecs] = useState(5);
  const [digits, setDigits] = useState("");
  const [wrong, setWrong] = useState(false);
  const [pleading, setPleading] = useState(false);
  const [modal, setModal] = useState<null | "memories" | "cake" | "letter">(null);
  const [slide, setSlide] = useState(0);
  const [candles, setCandles] = useState([true, true, true, true, true]);
  const [typed, setTyped] = useState(0);
  const name = p.recipient || "Birthday Star";
  const photos = p.photos?.length ? p.photos : secretMedia.memories;
  const letter = p.message || DEFAULT_LETTER;
  const passcode = p.proposalConfig?.passcode;

  useEffect(() => {
    if (stage !== "countdown") return;
    if (secs <= 0) { const t = window.setTimeout(() => setStage("passcode"), 900); return () => window.clearTimeout(t); }
    const t = window.setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [stage, secs]);
  useEffect(() => {
    if (modal !== "letter") return;
    setTyped(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped(letter.length); return; }
    const t = window.setInterval(() => setTyped((n) => { if (n >= letter.length) { window.clearInterval(t); return n; } return n + 2; }), 28);
    return () => window.clearInterval(t);
  }, [modal, letter]);

  const press = (d: string) => { if (wrong) return; setDigits((x) => (x.length < 4 ? x + d : x)); };
  const submit = () => {
    if (digits.length < 4) return;
    if (matchesSecretPasscode(digits, passcode)) { setStage("surprise"); celebrate(false); } else setWrong(true);
  };
  const blow = (i: number) => { const n = candles.map((c, j) => (j === i ? false : c)); setCandles(n); if (n.every((c) => !c)) celebrate(false); };
  const clock = `11 : 59 : ${String(60 - secs).padStart(2, "0")}`;

  return (
    <section className="secret-experience">
      <div className="secret-motes" aria-hidden>{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ left: `${(i * 7.3) % 100}%`, animationDelay: `${-i * 0.7}s` }} />)}</div>

      {stage === "countdown" && <main className="secret-stage">
        <p className="secret-eyebrow">✦ MIDNIGHT COUNTDOWN ✦</p>
        <div className="secret-clock" aria-live="polite">{secs > 0 ? clock : "12 : 00 : 00"}</div>
        <p className="secret-copy">Watch the clock strike 12:00:00</p>
        <Button variant="ghost" onClick={() => setStage("passcode")}>Skip ⏭</Button>
      </main>}

      {stage === "passcode" && <main className="secret-stage">
        <div className={`secret-card ${wrong ? "is-shake" : ""}`}>
          <img src={wrong ? secretMedia.wrong : secretMedia.cover} alt="" width={150} height={150} className="secret-hero" />
          <h1>Enter a passcode</h1>
          <p className="secret-copy">{wrong ? "Oops! Wrong passcode! Try again, cutie! 🥺" : digits.length < 4 ? "Enter the 4-digit secret passcode 💖" : "Tap 💖 to unlock"}</p>
          <div className="secret-dots" aria-label={`${digits.length} of 4 digits entered`}>{[0, 1, 2, 3].map((i) => <span key={i} className={i < digits.length ? "is-on" : ""}>{digits[i] ?? ""}</span>)}</div>
          {wrong ? <Button variant="hero" onClick={() => { setWrong(false); setDigits(""); }}>Try Again 🔄</Button> :
            <div className="secret-keypad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} type="button" onClick={() => press(d)}>{d}</button>)}
              <button type="button" aria-label="Delete digit" onClick={() => setDigits((x) => x.slice(0, -1))}><Delete size={18} /></button>
              <button type="button" onClick={() => press("0")}>0</button>
              <button type="button" aria-label="Unlock" onClick={submit}>💖</button>
            </div>}
          {p.demo && <p className="secret-hint">Demo passcode: {DEFAULT_SECRET_PASSCODE}</p>}
        </div>
      </main>}

      {(stage === "surprise" || stage === "excited") && <main key={stage} className="secret-stage">
        <h1 className="secret-arch">{stage === "surprise" ? "I have made something for you" : "Are you really excited?"}</h1>
        <img src={stage === "excited" ? secretMedia.excited : pleading ? secretMedia.pleading : secretMedia.dance} alt="" width={220} height={220} className="secret-hero" />
        {stage === "surprise" && <p className="secret-copy">{pleading ? "Are you sure? 🥺 Please say YES! 💖" : "Do you wanna see it?"}</p>}
        <div className="secret-actions">
          {stage === "surprise" ? <>
            <Button variant="hero" size="lg" onClick={() => setStage("excited")}>YES</Button>
            <Button variant="outline" size="lg" className={pleading ? "secret-wobble" : ""} onClick={() => setPleading(true)}>NO</Button>
          </> : <>
            <Button variant="hero" size="lg" onClick={() => { celebrate(false); setStage("gifts"); }}>YES</Button>
            <Button variant="hero" size="lg" onClick={() => { celebrate(false); setStage("gifts"); }}>YES</Button>
          </>}
        </div>
      </main>}

      {stage === "gifts" && <main className="secret-stage">
        <p className="secret-eyebrow">For {name} ✦</p>
        <h1>Tap on the mystery box to unlock your gifts!</h1>
        <img src={secretMedia.gift} alt="" width={160} height={160} className="secret-hero" />
        <div className="secret-boxes">
          {([["memories", "📸", "Memories"], ["cake", "🎂", "Birthday Cake"], ["letter", "💌", "A Letter"]] as const).map(([k, icon, label]) =>
            <button key={k} type="button" className="secret-box" onClick={() => { setModal(k); celebrate(false); }}><span>{icon}</span>{label}</button>)}
        </div>
      </main>}

      {modal && <div className="secret-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
        <div className="secret-modal-card">
          <button type="button" className="secret-close" aria-label="Close" onClick={() => setModal(null)}><X size={18} /></button>
          {modal === "memories" && <>
            <h2>M E M O R I E S ✦</h2>
            <div className="secret-line" aria-hidden />
            <figure className="secret-photo" key={slide}>
              <img src={photos[slide % photos.length]} alt={`Memory ${slide + 1}`} />
              <figcaption>{MEMORY_CAPTIONS[slide % MEMORY_CAPTIONS.length]}</figcaption>
            </figure>
            <div className="secret-actions">
              <Button variant="outline" aria-label="Previous memory" onClick={() => setSlide((s) => (s - 1 + photos.length) % photos.length)}>❮</Button>
              <span className="secret-copy">{(slide % photos.length) + 1} / {photos.length}</span>
              <Button variant="outline" aria-label="Next memory" onClick={() => setSlide((s) => (s + 1) % photos.length)}>❯</Button>
            </div>
          </>}
          {modal === "cake" && <>
            <h2>Make a wish 🎂</h2>
            <div className="secret-cake">
              <div className="secret-candles">{candles.map((on, i) => <button key={i} type="button" aria-label={`Blow candle ${i + 1}`} className={`sweet-candle ${on ? "is-lit" : ""}`} onClick={() => blow(i)}><span className="sweet-flame" /></button>)}</div>
              <div className="secret-cake-body"><span>HAPPY BIRTHDAY</span></div>
            </div>
            <p className="secret-copy">{candles.some(Boolean) ? "🕯️ Tap any candle to blow it out!" : "🎉 \"May your year be as sweet, bright, and delightful as this birthday cake! All your dreams will come true!\" 💖🍰✨"}</p>
            {!candles.some(Boolean) && <Button variant="outline" onClick={() => setCandles([true, true, true, true, true])}>🕯️ Relight Candles</Button>}
          </>}
          {modal === "letter" && <>
            <h2>A letter for {name} 💌</h2>
            <p className="secret-letter" onClick={() => setTyped(letter.length)}>{letter.slice(0, typed)}{typed < letter.length && <span className="secret-caret">|</span>}</p>
            {p.sender && typed >= letter.length && <p className="sweet-from">— {p.sender}</p>}
          </>}
        </div>
      </div>}
    </section>
  );
}
