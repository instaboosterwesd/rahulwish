import { useState } from 'react';
import { ArrowDown, ArrowRight, Check, Heart, RotateCcw, Sparkles, Camera, Mail, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { WrittenLetter, ScratchMemory } from '@/components/ProposalMoments';
import { TemplateAudio } from '@/components/TemplateAudio';
import { uploadedMedia } from '@/lib/uploaded-templates';
import { celebrate } from '@/lib/celebration';
import type { ExperienceProps } from '@/components/SurpriseExperience';
import gift from '@/assets/surprise-clay-gift.png';
import cake from '@/assets/templates/birthday-template-cake.png';
import disc from '@/assets/templates/birthday-template-disc.png';
import giftDisc from '@/assets/templates/your-surprise-template-disc.webp';
import envelope from '@/assets/templates/your-surprise-template-envelope.png';
import camera from '@/assets/templates/your-surprise-template-camera.png';
import music from '@/assets/templates/your-surprise-template-music.png';

function Brand() { return <div className="template-brand"><Heart size={15} /> always4you</div>; }

const noMessages = ['Please select one…', 'Hmm… are you sure?', 'One more little thought?', 'My heart was hoping for a yes.', 'You’re making this little bear blush.', 'Is that your final answer?'];
export function LoveExperience(p: ExperienceProps) {
  const [yes, setYes] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [position, setPosition] = useState(0);
  return <section className="uploaded-experience love-experience"><Brand /><main className="uploaded-stage">
    <p className="template-eyebrow">A very important little question</p>
    <img className="template-reaction" src={yes ? uploadedMedia.loveHappy : uploadedMedia.loveSad} width={250} height={250} alt={yes ? 'Two happy bears hugging' : 'A little bear waiting for your answer'} />
    <h1>{yes ? 'YAYYY!' : `${p.recipient},`}<span>{yes ? 'My favourite person.' : 'do you love me?'}</span></h1>
    {yes ? <><p>{p.headline || `I knew it all along, ${p.recipient}.`}</p><article className="template-note"><WrittenLetter text={p.message} /><p className="template-signature">With love, {p.sender}</p></article><Button variant="glass" onClick={() => { setYes(false); setAttempts(0); setPosition(0); }}><RotateCcw />Play again</Button></> : <>
      <p role="status" className="love-prompt">{noMessages[Math.min(attempts, noMessages.length - 1)]}</p>
      <div className={`love-answers love-position-${position}`} data-growth={Math.min(attempts, 4)}>
        <Button variant="hero" size="lg" className="love-yes" onClick={() => { setYes(true); celebrate(true); }}>Yes, always <Heart /></Button>
        {attempts < 20 && <Button variant="glass" size="lg" className="love-no" onClick={() => { setAttempts(v => v + 1); setPosition(v => (v + 1) % 4); }}>No</Button>}
      </div>
    </>}
    {p.audioUrl && <TemplateAudio src={p.audioUrl} title="A little love song" />}
  </main></section>;
}

export function BirthdayExperience(p: ExperienceProps) {
  const [joy, setJoy] = useState(0);
  const photo = p.photos?.[0] || p.cover || uploadedMedia.birthdayCover;
  return <section className="uploaded-experience birthday-experience"><Brand /><main>
    <section className="birthday-opening">
      <div className="birthday-lanterns" aria-hidden="true">{[0,1,2,3,4].map(i => <span key={i}><Sparkles /></span>)}</div>
      <p className="template-eyebrow">A little surprise for you</p><h1>Happy Birthday<span>{p.recipient}!</span></h1>
      <figure className="birthday-polaroid"><img src={photo} alt={`A birthday memory for ${p.recipient}`} width={600} height={600} /><figcaption>You make ordinary days extraordinary.</figcaption></figure>
      <p>Here’s to you and all the happiness you bring into the world.</p>
      <Button variant="glass" asChild><a href="#birthday-note">Your little note <ArrowDown /></a></Button>
    </section>
    <section className="birthday-note-section" id="birthday-note"><p className="template-eyebrow">Your little note</p><h2>{p.headline || 'A note for wonderful you.'}</h2>
      <article className="template-note"><p className="template-signature">Dear {p.recipient},</p><WrittenLetter text={p.message} /><p className="template-signature">With love, {p.sender}</p></article>
      <figure className="birthday-polaroid birthday-letter-photo"><img src={p.photos?.[1] || photo} alt="Another beautiful memory" width={600} height={600} /><figcaption>So glad you’re in my world.</figcaption></figure>
      <TemplateAudio src={p.audioUrl || uploadedMedia.birthdaySong} title={`A birthday song from ${p.sender}`} artwork={disc} />
    </section>
    <section className="birthday-finale"><p className="template-eyebrow">Final surprise</p><h2>Let’s celebrate!</h2><img src={cake} width={600} height={600} className="birthday-cake" alt="A decorated birthday cake" /><p>Make a wish, {p.recipient}. You deserve all the happiness today and always.</p>
      <p className="birthday-joy" role="status"><Heart size={16} /> JOY × {String(joy).padStart(2, '0')}</p>
      <Button variant="hero" size="lg" onClick={() => { setJoy(v => v + 1); celebrate(); }}>Celebrate <Sparkles /></Button>
    </section>
  </main></section>;
}

export function GiftExperience(p: ExperienceProps) {
  const [open, setOpen] = useState(false);
  const [viewed, setViewed] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [final, setFinal] = useState(false);
  const items = [{ key: 'letter', label: 'Your letter', src: envelope, icon: Mail }, { key: 'photo', label: 'Our memory', src: camera, icon: Camera }, { key: 'song', label: 'A song for you', src: music, icon: Music2 }];
  return <section className="uploaded-experience gift-experience"><Brand /><main className="uploaded-stage">
    <p className="template-eyebrow">{final ? 'A note, just for you' : open ? 'Three little pieces of my heart' : `A special delivery from ${p.sender}`}</p>
    <h1>{final ? 'Always & forever.' : open ? 'A little world of us.' : 'Something special'}<span>{final ? p.recipient : open ? 'All for you.' : `for ${p.recipient}.`}</span></h1>
    {!open ? <Button variant="ghost" className="template-gift-trigger" aria-label="Open your gift" onClick={() => { setOpen(true); celebrate(); }}><img src={gift} width={1024} height={1024} alt="A sculpted gift box tied with a pink ribbon" /></Button> : final ? <>
      <article className="template-note"><h2>{p.headline || 'You are my favourite surprise.'}</h2><WrittenLetter text={p.message} /><p className="template-signature">Always yours, {p.sender}</p></article><Button variant="glass" onClick={() => { setOpen(false); setFinal(false); setViewed([]); }}><RotateCcw />Replay your gift</Button>
    </> : <><div className="gift-discoveries">{items.map(item => <Button key={item.key} variant="ghost" className="gift-discovery" aria-label={item.label} onClick={() => { setActive(item.key); setViewed(v => v.includes(item.key) ? v : [...v, item.key]); }}><img src={item.src} width={300} height={300} alt="" /><span><item.icon size={15} />{item.label}{viewed.includes(item.key) && <Check size={16} />}</span></Button>)}</div><p className="template-discovery-count">{viewed.length} / 3 little surprises opened</p><Button variant="hero" size="lg" disabled={viewed.length < 3} onClick={() => setFinal(true)}>One last note <ArrowRight /></Button></>}
    <Dialog open={active !== null} onOpenChange={v => { if (!v) setActive(null); }}><DialogContent className="gift-dialog"><DialogTitle>{items.find(i => i.key === active)?.label}</DialogTitle><DialogDescription>A little something from {p.sender}, for {p.recipient}.</DialogDescription>
      {active === 'letter' && <><WrittenLetter text={p.message} /><p className="template-signature">{p.sender}</p></>}
      {active === 'photo' && <ScratchMemory src={p.photos?.[0] || (p.demo ? uploadedMedia.giftPhoto : p.cover) || uploadedMedia.giftPhoto} caption="You make every moment special." />}
      {active === 'song' && <><img src={p.cover || uploadedMedia.giftCover} alt="Our song cover" width={300} height={300} className="gift-song-cover" /><TemplateAudio src={p.audioUrl || uploadedMedia.giftSong} artwork={giftDisc} start={p.audioUrl ? 0 : 20} end={p.audioUrl ? undefined : 60} /></>}
    </DialogContent></Dialog>
  </main></section>;
}
