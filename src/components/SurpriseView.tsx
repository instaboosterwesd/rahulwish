import { useEffect, useRef, useState } from "react";
import { Heart, Music, Pause } from "lucide-react";
import { Petals } from "@/components/Petals";
import { Button } from "@/components/ui/button";
import { MusicBox } from "@/lib/music";

export function SurpriseView({ recipient, sender, headline, message, cover, photos = [] }: { recipient: string; sender: string; headline: string; message: string; cover: string; photos?: string[] }) {
  const [playing, setPlaying] = useState(false);
  const music = useRef<MusicBox | null>(null);
  useEffect(() => () => music.current?.stop(), []);
  return <section className="relative overflow-hidden bg-night px-6 py-16 text-center">
    <Petals count={18} />
    <div className="relative z-10 mx-auto max-w-2xl">
      <Heart className="mx-auto mb-5 h-9 w-9 fill-primary text-primary" />
      <p className="text-sm text-muted-foreground">For {recipient}</p>
      <h1 className="mt-4 break-words font-display text-4xl md:text-5xl">{headline || "You mean the world to me"}</h1>
      <img src={cover} alt="Your surprise" className="mx-auto mt-8 aspect-[4/3] w-full max-w-md rounded-3xl object-cover shadow-card" />
      <p className="mt-8 whitespace-pre-wrap break-words text-lg leading-relaxed">{message || "Every moment with you is something worth celebrating."}</p>
      {photos.length > 0 && <div className="mt-8 grid grid-cols-2 gap-3">{photos.map((photo) => <img key={photo} src={photo} alt="A special memory" className="aspect-square rounded-xl object-cover" />)}</div>}
      <p className="mt-7 font-script text-4xl text-primary">With love, {sender}</p>
      <Button className="mt-8" variant="outline" onClick={() => { if (!music.current) music.current = new MusicBox(); if (playing) music.current.stop(); else music.current.start(); setPlaying(!playing); }}>{playing ? <Pause /> : <Music />}{playing ? "Pause music" : "Play music"}</Button>
    </div>
  </section>;
}