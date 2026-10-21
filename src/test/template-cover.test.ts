import { describe, expect, it } from 'vitest';
import { portableTemplateCover } from '../lib/template-cover';
import { uploadedMedia } from '../lib/uploaded-templates';
import { validateTemplatePhoto } from '../lib/template-upload';

describe('Portable template covers', () => {
  it.each([['proposal', uploadedMedia.proposalCover], ['birthday', uploadedMedia.birthdayCover], ['love', uploadedMedia.loveHappy], ['your-surprise', uploadedMedia.giftCover]])('uses bundled %s images for old hosting pointers', (category, expected) => {
    expect(portableTemplateCover('/__l5e/assets-v1/old/cover.jpg', category)).toBe(expected);
    expect(expected).not.toContain('/__l5e/');
  });
  it('preserves an admin replacement photo', () => expect(portableTemplateCover('https://example.com/new-cover.jpg', 'proposal')).toBe('https://example.com/new-cover.jpg'));
  it('rejects non-photo uploads', () => expect(() => validateTemplatePhoto('text/html', 100)).toThrow());
  it('accepts supported photos', () => expect(() => validateTemplatePhoto('image/png', 100)).not.toThrow());
});