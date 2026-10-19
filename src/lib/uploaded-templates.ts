import proposalSong from '@/assets/imported/proposal-website-song.mp3.asset.json';
import proposalVoice from '@/assets/imported/proposal-website-voice-note.mp3.asset.json';
import birthdaySong from '@/assets/imported/birthday-template-happy-birthday.mp3.asset.json';
import giftSong from '@/assets/imported/your-surprise-template-song.mp3.asset.json';
import proposalCover from '@/assets/imported/proposal-website-cover.jpg.asset.json';
import birthdayCover from '@/assets/imported/birthday-template-cover.jpg.asset.json';
import giftCover from '@/assets/imported/your-surprise-template-cover.webp.asset.json';
import p1 from '@/assets/imported/proposal-website-p1.jpg.asset.json';
import p2 from '@/assets/imported/proposal-website-p2.jpg.asset.json';
import p3 from '@/assets/imported/proposal-website-p3.jpg.asset.json';
import p4 from '@/assets/imported/proposal-website-p4.jpg.asset.json';
import p5 from '@/assets/imported/proposal-website-p5.jpg.asset.json';
import p6 from '@/assets/imported/proposal-website-p6.jpg.asset.json';
export const uploadedMedia = { proposalSong: proposalSong.url, proposalVoice: proposalVoice.url, birthdaySong: birthdaySong.url, giftSong: giftSong.url, proposalCover: proposalCover.url, birthdayCover: birthdayCover.url, giftCover: giftCover.url, proposalPhotos: [p1.url,p2.url,p3.url,p4.url,p5.url,p6.url] };
export function uploadedExperienceKind(category: string) { const c=category.toLowerCase(); if(c==='proposal') return 'proposal'; if(c==='birthday') return 'birthday'; if(c==='love') return 'love'; if(c==='your-surprise') return 'gift'; return null; }
