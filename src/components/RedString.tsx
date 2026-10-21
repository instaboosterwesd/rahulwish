import { useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RedString({ onNext }: { onNext: () => void }) {
  const [value, setValue] = useState(0);
  return <>
    <h2 className="proposal-title">A little red thread.<br /><span>Always leads to you.</span></h2>
    <div className="proposal-thread"><Heart size={32} /><input type="range" aria-label="Pull our red string" min={0} max={100} value={value} onChange={e => setValue(Number(e.target.value))} /><Heart size={32} /></div>
    <p className="proposal-subtitle" role="status">{value === 100 ? 'Connected — always.' : `Pull a little closer · ${value}%`}</p>
    <Button variant="hero" size="lg" className="proposal-cta" disabled={value < 100} onClick={onNext}>Our next little moment <ArrowRight /></Button>
  </>;
}