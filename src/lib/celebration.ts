import confetti from 'canvas-confetti';

export function celebrate(hearts = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const styles = getComputedStyle(document.documentElement);
  const colors = ['--primary', '--gold', '--blush'].map(token => styles.getPropertyValue(token).trim());
  confetti({ particleCount: hearts ? 55 : 100, spread: 85, origin: { y: .65 }, colors, shapes: hearts ? [confetti.shapeFromText({ text: '♥', scalar: 2 })] : ['square', 'circle'], scalar: hearts ? 2 : 1, disableForReducedMotion: true });
}