import { karwaMedia } from '@/lib/karwa-media';
import { uploadedMedia } from '@/lib/uploaded-templates';

export function portableTemplateCover(cover: string, category: string): string {
  if (cover && !cover.includes('/__l5e/assets-v1/')) return cover;
  switch (category.toLowerCase()) {
    case 'proposal': return uploadedMedia.proposalCover;
    case 'birthday': return uploadedMedia.birthdayCover;
    case 'love': return uploadedMedia.loveHappy;
    case 'your-surprise': return uploadedMedia.giftCover;
    case 'karwa-chauth': return karwaMedia.cover;
    default: return cover;
  }
}