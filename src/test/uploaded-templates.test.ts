import { describe, expect, it } from 'vitest';
import { demoPhotos, uploadedExperienceKind, uploadedMedia } from '../lib/uploaded-templates';

describe('Uploaded template dispatch', () => {
  it.each([['proposal', 'proposal'], ['birthday', 'birthday'], ['love', 'love'], ['your-surprise', 'gift']])('routes %s to its dedicated presentation', (category, kind) => {
    expect(uploadedExperienceKind(category)).toBe(kind);
  });
  it('does not replace unrelated categories', () => expect(uploadedExperienceKind('friendship')).toBeNull());
  it('uses the six original proposal memories', () => expect(demoPhotos('proposal', 'cover')).toEqual(uploadedMedia.proposalPhotos));
  it('uses the actual gift photo rather than its song cover', () => {
    expect(demoPhotos('your-surprise', 'cover')).toEqual([uploadedMedia.giftPhoto]);
    expect(uploadedMedia.giftPhoto).not.toBe(uploadedMedia.giftCover);
  });
  it('uses the birthday photo', () => expect(demoPhotos('birthday', 'cover')).toEqual([uploadedMedia.birthdayCover]));
});