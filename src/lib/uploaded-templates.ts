import { karwaMedia } from '@/lib/karwa-media';
import { diwaliMedia } from '@/lib/diwali';
import proposalSong from '@/assets/templates/proposal-website-song.mp3';
import proposalVoice from '@/assets/templates/proposal-website-voice-note.mp3';
import birthdaySong from '@/assets/templates/birthday-template-happy-birthday.mp3';
import giftSong from '@/assets/templates/your-surprise-template-song.mp3';
import proposalCover from '@/assets/templates/proposal-website-cover.jpg';
import birthdayCover from '@/assets/templates/birthday-template-cover.jpg';
import giftCover from '@/assets/templates/your-surprise-template-cover.webp';
import giftPhoto from '@/assets/templates/your-surprise-template-photo.jpg';
import loveHappy from '@/assets/templates/love-template-mimibubu.gif';
import loveSad from '@/assets/templates/love-template-sad-bubu.gif';
import p1 from '@/assets/templates/proposal-website-p1.jpg';
import p2 from '@/assets/templates/proposal-website-p2.jpg';
import p3 from '@/assets/templates/proposal-website-p3.jpg';
import p4 from '@/assets/templates/proposal-website-p4.jpg';
import p5 from '@/assets/templates/proposal-website-p5.jpg';
import p6 from '@/assets/templates/proposal-website-p6.jpg';
export const uploadedMedia = { proposalSong: proposalSong, proposalVoice: proposalVoice, birthdaySong: birthdaySong, giftSong: giftSong, proposalCover: proposalCover, birthdayCover: birthdayCover, giftCover: giftCover, giftPhoto: giftPhoto, loveHappy: loveHappy, loveSad: loveSad, proposalPhotos: [p1,p2,p3,p4,p5,p6] };
export function demoPhotos(category: string, cover: string) {
  switch (uploadedExperienceKind(category)) {
    case 'proposal': return uploadedMedia.proposalPhotos;
    case 'birthday': return [uploadedMedia.birthdayCover];
    case 'gift': return [uploadedMedia.giftPhoto];
    case 'karwa': return karwaMedia.demoPhotos;
    case 'diwali': return diwaliMedia.demoPhotos;
    default: return [cover];
  }
}
export function uploadedExperienceKind(category: string) { const c=category.toLowerCase(); if(c==='proposal') return 'proposal'; if(c==='birthday') return 'birthday'; if(c==='love') return 'love'; if(c==='your-surprise') return 'gift'; if(c==='karwa-chauth') return 'karwa'; if(c==='diwali') return 'diwali'; return null; }
