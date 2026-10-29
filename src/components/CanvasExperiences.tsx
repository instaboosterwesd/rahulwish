import { useEffect, useRef, useState } from "react";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import { gardenMessage } from "@/lib/new-templates";

/** Animated Garden — procedural meadow; the engine loads only in the browser. */
export function GardenExperience(p: ExperienceProps) {
  const root = useRef<HTMLDivElement>(null);
  const msg = gardenMessage(p.message);
  useEffect(() => {
    let cleanup: (() => void) | undefined; let cancelled = false;
    import("@/lib/engines/garden-engine").then(({ mountGarden }) => {
      if (cancelled || !root.current) return;
      cleanup = mountGarden(root.current, { to: p.recipient || undefined, from: p.sender || undefined, msg });
    });
    return () => { cancelled = true; cleanup?.(); };
  }, [p.recipient, p.sender, msg]);
  return (
    <div ref={root} className="garden-root" data-theme="midnight">
      <div id="stage" aria-label="A dense blooming meadow">
        <div id="sky" />
        <div id="horizon" />
        <div id="camera">
          <svg id="garden" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Lush blooming floral meadow"><defs id="shared-defs" /></svg>
        </div>
        <canvas id="dust" aria-hidden="true" />
        <div id="veil" />
        <div id="vignette" />
        <svg id="grain" aria-hidden="true" />
        <div id="toast" role="status" />
      </div>
    </div>
  );
}

/** 3D Hearts Universe — tap glowing hearts to pop them; three.js loads only in the browser. */
export function HeartExperience(p: ExperienceProps) {
  const root = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);
  const name = p.recipient;
  const from = p.sender;
  useEffect(() => {
    let cleanup: (() => void) | undefined; let cancelled = false;
    Promise.all([import("three"), import("three/examples/jsm/controls/OrbitControls.js"), import("@/lib/engines/heart-engine")]).then(([THREE, { OrbitControls }, { mountHeart }]) => {
      if (cancelled || !root.current) return;
      const extra = [name && `${name}, I Love You ❤️`, name && `Forever Yours, ${name} 💕`, from && `From ${from} 💌`].filter(Boolean) as string[];
      cleanup = mountHeart(root.current, THREE, OrbitControls, extra);
    });
    return () => { cancelled = true; cleanup?.(); };
  }, [name, from]);
  return (
    <div ref={root} className="heart-root" onPointerDown={() => setHint(false)}>
      <div data-canvas className="heart-canvas" />
      <div data-float className="heart-float" />
      {hint && <div className="heart-hint" aria-live="polite">
        {name && <p className="heart-name">For {name} ❤️</p>}
        <p>Tap the glowing hearts ✨ · Drag to explore</p>
      </div>}
    </div>
  );
}
