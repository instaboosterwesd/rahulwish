// Soft music-box + pad melody generated live in the browser (no audio files needed).
type Mood = "romance" | "birthday" | "festive";

const MELODIES: Record<Mood, number[]> = {
  // semitone offsets from root
  romance: [0, 7, 12, 16, 14, 12, 7, 9, 5, 12, 9, 7, 4, 7, 12, 11],
  birthday: [0, 0, 2, 0, 5, 4, -1, 0, 0, 2, 0, 7, 5, -1, 0, 12],
  festive: [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2],
};
const CHORDS = [
  [0, 4, 7],
  [-3, 0, 4],
  [-7, -3, 0],
  [-5, -1, 2],
];

export class MusicBox {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  constructor(private mood: Mood = "romance") {}

  start() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.38;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.35;
    delay.connect(fb).connect(delay);
    this.master.connect(this.ctx.destination);
    this.master.connect(delay);
    delay.connect(this.ctx.destination);
    const tempo = this.mood === "birthday" ? 330 : 420;
    this.timer = window.setInterval(() => this.tick(), tempo);
  }

  private note(freq: number, t: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private tick() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const root = this.mood === "festive" ? 293.66 : 261.63;
    const mel = MELODIES[this.mood];
    const semi = mel[this.step % mel.length] ?? 0;
    const f = root * Math.pow(2, (semi + 12) / 12);
    this.note(f, t, 1.4, "sine", 0.18);
    this.note(f * 2, t, 0.6, "triangle", 0.03);
    if (this.step % 8 === 0) {
      const chord = CHORDS[(this.step / 8) % CHORDS.length] ?? [0, 4, 7];
      chord.forEach((c) => this.note(root * Math.pow(2, c / 12), t, 3.4, "triangle", 0.05));
    }
    this.step++;
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      window.setTimeout(() => ctx.close(), 700);
    }
    this.ctx = null;
    this.master = null;
  }
}
