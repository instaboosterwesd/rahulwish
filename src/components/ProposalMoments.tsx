import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import luxuryRing from "@/assets/proposal-luxury-ring.webp";

export function WrittenLetter({ text }: { text: string }) {
  const [length, setLength] = useState(0);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    setLength(0); setFinished(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setLength(text.length); setFinished(true); return; }
    const timer = window.setInterval(() => setLength((current) => Math.min(text.length, current + 2)), 30);
    return () => window.clearInterval(timer);
  }, [text]);
  const done = finished || length >= text.length;
  return <><p className="proposal-letter-message" aria-label="Your love letter">{done ? text : text.slice(0, length)}{!done && <span className="proposal-writing-cursor" aria-hidden="true">|</span>}</p>{!done && <Button variant="ghost" size="sm" className="proposal-read-all" onClick={() => setFinished(true)}>Read the whole letter</Button>}</>;
}

export function ScratchMemory({ src, caption }: { src: string; caption: string }) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    setRevealed(false); dragging.current = false; last.current = null;
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const styles = getComputedStyle(element);
    context.fillStyle = styles.getPropertyValue("--proposal-fold");
    context.fillRect(0, 0, 600, 600);
    context.fillStyle = styles.getPropertyValue("--proposal-rose");
    context.textAlign = "center"; context.font = "28px sans-serif";
    context.fillText("A memory, just for you", 300, 285);
    context.font = "20px sans-serif"; context.fillText("Scratch to uncover", 300, 330);
  }, [src]);
  const scratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const element = canvas.current;
    const context = element?.getContext("2d", { willReadFrequently: true });
    if (!element || !context) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * 600 / bounds.width;
    const y = (event.clientY - bounds.top) * 600 / bounds.height;
    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 70; context.lineCap = "round";
    context.beginPath(); context.moveTo(last.current?.x ?? x, last.current?.y ?? y); context.lineTo(x, y); context.stroke();
    context.beginPath(); context.arc(x, y, 35, 0, Math.PI * 2); context.fill();
    last.current = { x, y };
    const pixels = context.getImageData(0, 0, 600, 600).data;
    let cleared = 0;
    for (let i = 3; i < pixels.length; i += 64) if (pixels[i] === 0) cleared++;
    if (cleared / (pixels.length / 64) > .42) setRevealed(true);
  };
  return <div className="proposal-scratch-wrap"><figure className="proposal-polaroid"><div className="proposal-scratch-photo"><img src={src} alt={caption} width={600} height={600} />{!revealed && <canvas ref={canvas} width={600} height={600} aria-label="Scratch to reveal your memory" onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); scratch(event); }} onPointerMove={scratch} onPointerUp={() => { dragging.current = false; last.current = null; }} onPointerCancel={() => { dragging.current = false; last.current = null; }} />}</div><figcaption>{caption}</figcaption></figure>{!revealed && <Button variant="glass" size="sm" className="proposal-cta" onClick={() => setRevealed(true)}><Sparkles size={16} />Reveal memory</Button>}</div>;
}

export function EmergingRing({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const cancel = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; setHolding(false); };
  useEffect(() => () => { if (hold.current) clearTimeout(hold.current); }, []);
  return <div className={`proposal-jewel-scene ${opened ? "is-open" : ""}`}>
    <div className="proposal-jewel-lid" aria-hidden="true"><span>always yours</span></div>
    <div className="proposal-jewel"><img src={luxuryRing} width={1024} height={1024} loading="lazy" alt="A sculpted champagne-gold engagement ring with a brilliant solitaire diamond" className="proposal-luxury-ring" /><Sparkles className="proposal-jewel-glint" size={18} aria-hidden="true" /></div>
    <div className="proposal-jewel-box" aria-hidden="true"><span>our forever</span></div>
    {!opened && <Button variant="ghost" className={`proposal-jewel-trigger ${holding ? 'is-holding' : ''}`} aria-label="Hold to reveal the ring" onPointerDown={() => { setHolding(true); hold.current = setTimeout(() => { onOpen(); setHolding(false); }, 1600); }} onPointerUp={cancel} onPointerCancel={cancel} onPointerLeave={cancel} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}><span>Hold to open your promise</span><span className="proposal-hold-progress" /></Button>}
  </div>;
}