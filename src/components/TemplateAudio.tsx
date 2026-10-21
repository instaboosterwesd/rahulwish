import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TemplateAudio({ src, title = 'A song for you', artwork, start = 0, end, onEnded }: { src: string; title?: string; artwork?: string; start?: number; end?: number | undefined; onEnded?: () => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(start);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    setPlaying(false); setError(false); setTime(start); setDuration(0);
    const track = new Audio(src); track.preload = 'metadata'; track.loop = !onEnded; track.volume = .55; audio.current = track;
    track.onloadedmetadata = () => { track.currentTime = Math.min(start, track.duration); setDuration(track.duration); };
    track.ontimeupdate = () => { if (end && track.currentTime >= Math.min(end, track.duration)) track.currentTime = start; setTime(track.currentTime); };
    track.onended = () => { setPlaying(false); onEnded?.(); };
    track.onerror = () => { setPlaying(false); setError(true); };
    return () => { track.pause(); track.ontimeupdate = null; track.onloadedmetadata = null; track.onended = null; track.onerror = null; track.removeAttribute('src'); track.load(); audio.current = null; };
  }, [src, start, end, onEnded]);
  const limit = duration ? Math.min(end ?? duration, duration) : start + 1;
  return <div className={`template-player ${playing ? 'is-playing' : ''}`}>
    {artwork ? <img className="template-disc" src={artwork} width={54} height={54} alt="" /> : <Music2 aria-hidden="true" />}
    <div className="template-player-meta"><p>{title}</p><input type="range" aria-label="Song position" min={start} max={limit} step={.1} value={Math.min(time, limit)} disabled={!duration} onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value); setTime(Number(e.target.value)); }} />{error && <p role="alert">Music couldn’t play. Please try again.</p>}</div>
    <Button size="icon" variant="glass" title={playing ? 'Pause song' : 'Play song'} aria-label={playing ? 'Pause song' : 'Play song'} onClick={async () => { if (!audio.current) return; if (playing) { audio.current.pause(); setPlaying(false); } else try { await audio.current.play(); setPlaying(true); setError(false); } catch { setError(true); } }}>{playing ? <Pause /> : <Play />}</Button>
  </div>;
}
