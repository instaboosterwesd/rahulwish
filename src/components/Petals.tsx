import { useEffect, useState } from "react";

type P = { left: number; delay: number; dur: number; size: number; char: string };

export function Petals({ count = 18, chars = ["❤", "✿", "❀", "✦"] }: { count?: number; chars?: string[] }) {
  const [petals, setPetals] = useState<P[]>([]);
  useEffect(() => {
    setPetals(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 12,
        dur: 10 + Math.random() * 12,
        size: 10 + Math.random() * 18,
        char: chars[Math.floor(Math.random() * chars.length)],
      })),
    );
  }, [count]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 text-primary/60"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `fall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
