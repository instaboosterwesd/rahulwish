import { useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function TemplateAudio({ src, title = 'A song for you' }: { src: string; title?: string }) {
 const audio=useRef<HTMLAudioElement|null>(null); const [playing,setPlaying]=useState(false); const [error,setError]=useState(false); const [time,setTime]=useState(0); const [duration,setDuration]=useState(0);
 useEffect(()=>{ const track=new Audio(src); track.loop=true; track.volume=.55; audio.current=track; track.ontimeupdate=()=>setTime(track.currentTime); track.onloadedmetadata=()=>setDuration(track.duration); return ()=>{track.pause();track.removeAttribute('src');track.load();audio.current=null;}; },[src]);
 return <div className="template-player"><Music2 aria-hidden="true"/><div className="template-player-meta"><p>{title}</p><input type="range" aria-label="Song position" min={0} max={duration||1} step={.1} value={time} disabled={!duration} onChange={e=>{if(audio.current) audio.current.currentTime=Number(e.target.value);setTime(Number(e.target.value));}}/>{error&&<p role="alert">Music couldn’t play. Please try again.</p>}</div><Button size="icon" variant="glass" aria-label={playing?'Pause song':'Play song'} onClick={async()=>{if(!audio.current)return;if(playing){audio.current.pause();setPlaying(false);}else try{await audio.current.play();setPlaying(true);setError(false);}catch{setError(true);}}}>{playing?<Pause/>:<Play/>}</Button></div>;
}
