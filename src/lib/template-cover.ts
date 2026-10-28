import { karwaMedia } from '@/lib/karwa-media';
import { uploadedMedia } from '@/lib/uploaded-templates';
import { diwaliMedia } from '@/lib/diwali';

export function portableTemplateCover(cover: string, category: string): string {
  if (cover && !cover.includes('/__l5e/assets-v1/')) return cover;
  switch (category.toLowerCase()) {
    case 'proposal': return uploadedMedia.proposalCover;
    case 'birthday': return uploadedMedia.birthdayCover;
    case 'love': return uploadedMedia.loveHappy;
    case 'your-surprise': return uploadedMedia.giftCover;
    case 'karwa-chauth': return karwaMedia.cover;
    case 'diwali': return diwaliMedia.cover;
    default: return cover;
  }
}