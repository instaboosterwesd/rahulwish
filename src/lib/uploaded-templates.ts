import proposalSong from '@/assets/templates/proposal-website-song.mp3.asset.json';
import proposalVoice from '@/assets/templates/proposal-website-voice-note.mp3.asset.json';
import birthdaySong from '@/assets/templates/birthday-template-happy-birthday.mp3.asset.json';
import giftSong from '@/assets/templates/your-surprise-template-song.mp3.asset.json';
import proposalCover from '@/assets/templates/proposal-website-cover.jpg.asset.json';
import birthdayCover from '@/assets/templates/birthday-template-cover.jpg.asset.json';
import giftCover from '@/assets/templates/your-surprise-template-cover.webp.asset.json';
import giftPhoto from '@/assets/templates/your-surprise-template-photo.jpg.asset.json';
import loveHappy from '@/assets/templates/love-template-mimibubu.gif.asset.json';
import loveSad from '@/assets/templates/love-template-sad-bubu.gif.asset.json';
import p1 from '@/assets/templates/proposal-website-p1.jpg.asset.json';
import p2 from '@/assets/templates/proposal-website-p2.jpg.asset.json';
import p3 from '@/assets/templates/proposal-website-p3.jpg.asset.json';
import p4 from '@/assets/templates/proposal-website-p4.jpg.asset.json';
import p5 from '@/assets/templates/proposal-website-p5.jpg.asset.json';
import p6 from '@/assets/templates/proposal-website-p6.jpg.asset.json';
export const uploadedMedia = { proposalSong: proposalSong.url, proposalVoice: proposalVoice.url, birthdaySong: birthdaySong.url, giftSong: giftSong.url, proposalCover: proposalCover.url, birthdayCover: birthdayCover.url, giftCover: giftCover.url, giftPhoto: giftPhoto.url, loveHappy: loveHappy.url, loveSad: loveSad.url, proposalPhotos: [p1.url,p2.url,p3.url,p4.url,p5.url,p6.url] };
export function demoPhotos(category: string, cover: string) {
  switch (uploadedExperienceKind(category)) {
    case 'proposal': return uploadedMedia.proposalPhotos;
    case 'birthday': return [uploadedMedia.birthdayCover];
    case 'gift': return [uploadedMedia.giftPhoto];
    default: return [cover];
  }
}
export function uploadedExperienceKind(category: string) { const c=category.toLowerCase(); if(c==='proposal') return 'proposal'; if(c==='birthday') return 'birthday'; if(c==='love') return 'love'; if(c==='your-surprise') return 'gift'; return null; }
