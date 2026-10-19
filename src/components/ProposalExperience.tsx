import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Music2, Pause, RotateCcw, Sparkles, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExperienceProps } from "@/components/SurpriseExperience";
import garden from "@/assets/proposal-garden.jpg";
import ring from "@/assets/proposal-ring.jpg";
import { WrittenLetter, ScratchMemory, EmergingRing } from "@/components/ProposalMoments";
import { TemplateAudio } from "@/components/TemplateAudio";
import { uploadedMedia } from "@/lib/uploaded-templates";
import { scoreProposalQuiz, canContinueProposalQuiz } from "@/lib/proposal";
import { Input } from "@/components/ui/input";
import { matchesProposalSecret, proposalChapters as chapters, proposalQuiz } from "@/lib/proposal";



export function ProposalExperience({ recipient, sender, headline, message, photos, cover, proposalConfig, audioUrl, demo }: ExperienceProps) {
  const [step, setStep] = useState(0);
  const [secret, setSecret] = useState("");
  const [secretError, setSecretError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [furthest, setFurthest] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const questions = proposalConfig?.quiz?.length ? proposalConfig.quiz : proposalQuiz;
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [reason, setReason] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [photo, setPhoto] = useState(0);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [thinking, setThinking] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const memories = photos?.length ? photos : demo ? uploadedMedia.proposalPhotos : [cover];

  useEffect(() => {
    const track = new Audio(audioUrl || uploadedMedia.proposalSong);
    track.loop = true;
    track.volume = 0.55;
    audio.current = track;
    return () => { track.pause(); track.removeAttribute("src"); track.load(); audio.current = null; };
  }, [audioUrl]);

  useEffect(() => {
    if (step !== 8) return;
    setCountdown(3);
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const play = async () => {
    if (!audio.current) return;
    try { await audio.current.play(); setPlaying(true); setAudioFailed(false); }
    catch { setPlaying(false); setAudioFailed(true); }
  };
  const toggleMusic = () => {
    if (playing) { audio.current?.pause(); setPlaying(false); }
    else void play();
  };
  const next = () => { const target = Math.min(step + 1, chapters.length - 1); setStep(target); setFurthest((current) => Math.max(current, target)); };
  const replay = () => { setStep(0); setFurthest(0); setUnlocked(false); setSecret(""); setSecretError(false); setQuizIndex(0); setQuizAnswer(null); setAnswers([]); setReason(0); setOpened(false); setThinking(false); setPhoto(0); if (audio.current) audio.current.currentTime = 0; };

  return (
    <section className={`proposal-experience ${step === 11 ? "proposal-celebrating" : ""}`} aria-label="Your proposal surprise">
      <img src={garden} width={1024} height={1536} alt="Roses framing a lakeside garden at sunset" className="proposal-backdrop" />
      <div className="proposal-veil" aria-hidden="true" />
      <header className="proposal-header">
        <span className="proposal-wordmark"><Heart size={15} /> always4you</span>
        <div className="flex items-center gap-2">
          {step > 1 && <Button variant="ghost" size="icon" title="Previous chapter" aria-label="Previous chapter" onClick={() => setStep(step - 1)}><ArrowLeft /></Button>}
          <Button variant="glass" size="icon" title={playing ? "Pause our song" : "Play our song"} aria-label={playing ? "Pause music" : "Play music"} onClick={toggleMusic}>{playing ? <Pause /> : <Music2 />}</Button>
        </div>
      </header>

      <main className="proposal-stage" key={step}>
        <p className="proposal-eyebrow">{chapters[step]} <span aria-hidden="true">—</span> {String(step + 1).padStart(2, "0")}</p>

        {step === 0 && <>
          <div className="proposal-question-mark" aria-hidden="true"><LockKeyhole size={30} /></div>
          <h1 className="proposal-title">A little secret.<br /><span>Only for you.</span></h1>
          <p className="proposal-subtitle">The password is the name of my favourite person.</p>
          <form className="proposal-unlock" onSubmit={(event) => { event.preventDefault(); if (matchesProposalSecret(secret, recipient)) { setUnlocked(true); setSecretError(false); void play(); next(); } else setSecretError(true); }}>
            <label htmlFor="proposal-secret">Your name</label>
            <Input id="proposal-secret" type="password" autoComplete="off" value={secret} maxLength={100} onChange={(event) => { setSecret(event.target.value); setSecretError(false); }} aria-invalid={secretError} aria-describedby="proposal-secret-hint" required />
            <p id="proposal-secret-hint" className="proposal-hint">A little hint: {recipient}</p>
            {secretError && <p role="alert" className="proposal-reassurance">Not quite, my love. Try the name in the hint.</p>}
            <Button type="submit" variant="hero" size="lg" className="proposal-cta">Unlock our story <ArrowRight /></Button>
          </form>
          <p className="proposal-signature">with love, {sender}</p>
        </>}

        {step === 1 && <>
          <h1 className="proposal-title">Of all the people,<br /><span>it was always you.</span></h1>
          <p className="proposal-subtitle">{recipient}, there’s something my heart wants to say.</p>
          <Button variant="ghost" className="proposal-envelope" aria-label="Open your letter" onClick={() => { void play(); next(); }}>
            <span className="proposal-envelope-paper">For {recipient}<span className="font-script">with all my love</span></span>
            <span className="proposal-envelope-fold" />
            <span className="proposal-seal"><Heart size={20} /></span>
          </Button>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={() => { void play(); next(); }}>Open my heart <ArrowRight /></Button>
          <p className="proposal-signature">a little something, from {sender}</p>
        </>}

        {step === 2 && <>
          <h2 className="proposal-title">It started with you.<br /><span>And became everything.</span></h2>
          <ol className="proposal-timeline">
            <li><span>01</span><div><h3>A little hello</h3><p>Somehow, an ordinary moment became the beginning of my favourite story.</p></div></li>
            <li><span>02</span><div><h3>A thousand little moments</h3><p>The laughs. The long conversations. The comfort of just being us.</p></div></li>
            <li><span>03</span><div><h3>And now, {recipient}…</h3><p>There is something I have been waiting to tell you.</p></div></li>
          </ol>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>Read my heart <ArrowRight /></Button>
        </>}

        {step === 4 && <>
          <h2 className="proposal-title">A tiny love quiz.<br /><span>You know my heart.</span></h2>
          <div className="proposal-quiz">
            <p className="proposal-counter">{quizIndex + 1} / {questions.length}</p>
            <h3>{questions[quizIndex]?.question}</h3>
            <div className="proposal-quiz-options">{questions[quizIndex]?.options.map((option, index) => <Button key={option} variant="glass" className={`proposal-quiz-option ${quizAnswer === index ? "is-selected" : ""}`} disabled={quizAnswer !== null} onClick={() => { setQuizAnswer(index); setAnswers(current => { const updated = [...current]; updated[quizIndex] = index; return updated; }); }}>{option}{quizAnswer === index && quizAnswer === questions[quizIndex]?.answer && <Check size={18} />}</Button>)}</div>
            {quizAnswer !== null && <p role="status" className="proposal-reassurance">{quizAnswer === questions[quizIndex]?.answer ? "Exactly. You already knew, didn’t you?" : "Not this time. Another little thing to discover about us."}</p>}
          </div>
          <Button variant="hero" size="lg" className="proposal-cta" disabled={!canContinueProposalQuiz(quizAnswer)} onClick={() => { if (quizIndex < questions.length - 1) { setQuizIndex(quizIndex + 1); setQuizAnswer(null); } else next(); }}>{quizIndex < questions.length - 1 ? "One more question" : "Our favourite memories"}<ArrowRight /></Button>
        </>}

        {step === 5 && <>
          <h2 className="proposal-title">My favourite place?<br /><span>Right beside you.</span></h2>
          <ScratchMemory key={photo} src={memories[photo] ?? cover} caption="you & me. my favourite story." />
          <div className="flex items-center justify-center gap-4">
            <Button variant="glass" size="icon" disabled={memories.length < 2} aria-label="Previous memory" onClick={() => setPhoto((photo + memories.length - 1) % memories.length)}><ArrowLeft /></Button>
            <span className="proposal-counter">{photo + 1} / {memories.length}</span>
            <Button variant="glass" size="icon" disabled={memories.length < 2} aria-label="Next memory" onClick={() => setPhoto((photo + 1) % memories.length)}><ArrowRight /></Button>
          </div>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>What I love about you <ArrowRight /></Button>
        </>}

        {step === 3 && <>
          <h2 className="proposal-title">A thousand feelings.<br /><span>One little letter.</span></h2>
          <article className="proposal-letter">
            <p className="proposal-letter-greeting">My dearest {recipient},</p>
            <h3>{headline || "You are my favourite forever."}</h3>
            <WrittenLetter text={message || "Tumhare saath har chhota pal bhi khaas lagta hai. I don’t need a perfect life. I just want a life with you."} />
            <p className="proposal-letter-sign">Always yours,<br /><span>{sender}</span></p>
          </article>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>Do you know my heart? <ArrowRight /></Button>
        </>}

        {step === 6 && <>
          <h2 className="proposal-title">A million reasons.<br /><span>All of them, you.</span></h2>
          <div className="proposal-reason" key={reason}><span className="proposal-reason-number">0{reason + 1}</span><p>{["Your smile makes the world feel a little softer.", "With you, I can be completely myself.", "You turn the smallest moments into my favourite memories.", "Every time I picture my future, you are there."][reason]}</p></div>
          <Button variant="glass" className="proposal-cta" onClick={() => setReason((current) => (current + 1) % 4)}>Another reason <Heart size={16} /></Button>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>Imagine our tomorrow <ArrowRight /></Button>
        </>}

        {step === 7 && <>
          <h2 className="proposal-title">Not a perfect life.<br /><span>A life with you.</span></h2>
          <div className="proposal-future"><p>Slow mornings. Two cups of coffee.</p><p>New places. Your hand in mine.</p><p>A home filled with our laughter.</p><p>Choosing each other, every day.</p></div>
          <p className="proposal-subtitle">{recipient}, that is the forever I dream of.</p>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={next}>There’s one last surprise <ArrowRight /></Button>
        </>}

        {step === 8 && <>
          <h2 className="proposal-title">Take a little breath.<br /><span>This is our moment.</span></h2>
          <div className="proposal-countdown" role="status" aria-live="polite">{countdown > 0 ? countdown : <Heart size={56} />}</div>
          <p className="proposal-subtitle">{countdown > 0 ? "A promise, waiting just for you." : "My heart is ready. Are you?"}</p>
          <Button variant="hero" size="lg" className="proposal-cta" disabled={countdown > 0} onClick={next}>Show me the surprise <ArrowRight /></Button>
        </>}

        {step === 9 && <>
          <h2 className="proposal-title">Not just a ring.<br /><span>A little forever.</span></h2>
          <EmergingRing opened={opened} onOpen={() => setOpened(true)} />
          {opened && demo && <TemplateAudio src={uploadedMedia.proposalVoice} title="A little voice note" />}
          <p className="proposal-subtitle">{opened ? "Every tomorrow. Every adventure. With you." : "Some promises deserve a beautiful beginning."}</p>
          <Button variant="hero" size="lg" className="proposal-cta" onClick={opened ? next : () => setOpened(true)}>{opened ? "Can I ask you something?" : "Unwrap my promise"} <ArrowRight /></Button>
        </>}

        {step === 10 && <>
          <div className="proposal-question-mark" aria-hidden="true"><Heart size={32} /></div>
          <p className="proposal-subtitle">{recipient}, my today and all my tomorrows…</p>
          <h2 className="proposal-title">Will you<br /><span>marry me?</span></h2>
          <p className="proposal-subtitle">I choose you. In every lifetime.</p>
          <div className="proposal-answer-row">
            <Button variant="hero" size="lg" onClick={next}>Yes, a thousand times <Heart /></Button>
            <Button variant="glass" size="lg" onClick={() => setThinking(true)}>Let me think</Button>
          </div>
          {thinking && <p className="proposal-reassurance" role="status">Take your time. Your answer is yours, and you mean the world to me.</p>}
        </>}

        {step === 11 && <>
          <div className="proposal-question-mark" aria-hidden="true"><Check size={32} /></div>
          <h2 className="proposal-title">And just like that,<br /><span>our forever begins.</span></h2>
          <img src={ring} alt="Our forever promise" width={1024} height={1024} loading="lazy" className="proposal-finale-photo" />
          <p className="proposal-couple">{recipient} <Heart size={20} /> {sender}</p>
          <p className="proposal-subtitle">One yes. A lifetime of us.</p>
          <p className="proposal-final-score" role="status">Our love quiz · {scoreProposalQuiz(questions, answers)} / {questions.length} correct</p>
          <Button variant="glass" className="proposal-cta" onClick={replay}><RotateCcw /> Relive our story</Button>
        </>}
      </main>

      <footer className="proposal-footer">
        <nav aria-label="Proposal chapters" className="proposal-progress">{chapters.map((chapter, i) => <Button key={chapter} variant="ghost" aria-label={`Chapter ${i + 1}: ${chapter}`} aria-current={i === step ? "step" : undefined} disabled={i > furthest || (i > 0 && !unlocked)} onClick={() => setStep(i)} className={`proposal-progress-dot ${i <= step ? "is-complete" : ""}`}><span /></Button>)}</nav>
        <span className="proposal-track">{audioFailed ? "Music couldn’t play — tap music to retry" : playing ? "♪ Our song · just for you" : "Made with a heart full of you"}</span>
      </footer>
    </section>
  );
}