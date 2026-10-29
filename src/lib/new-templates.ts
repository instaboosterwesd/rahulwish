import sweetCat from "@/assets/sweet-bday/cat.gif";
import sweetCake from "@/assets/sweet-bday/kawaii-cake.gif";
import sweetBunny from "@/assets/sweet-bday/bunny.gif";
import sweetParty from "@/assets/sweet-bday/celebration-cake.gif";
import sweetSong from "@/assets/sweet-bday/song.mp3";
import sweet1 from "@/assets/sweet-bday/photo1.jpg";
import sweet2 from "@/assets/sweet-bday/photo2.jpg";
import sweet3 from "@/assets/sweet-bday/photo3.jpg";
import apologyPleading from "@/assets/apology/pleading.gif";
import apologyCorgi from "@/assets/apology/corgi.gif";
import apologyCrying from "@/assets/apology/crying.gif";
import apologyBegging from "@/assets/apology/zookiz.gif";
import apologyLove from "@/assets/apology/corgi-love.gif";
import secretCover from "@/assets/secret-gift/birthday.png";
import secretDance from "@/assets/secret-gift/dance.gif";
import secretExcited from "@/assets/secret-gift/excited.gif";
import secretGift from "@/assets/secret-gift/gift.gif";
import secretPleading from "@/assets/secret-gift/pleading.gif";
import secretWrong from "@/assets/secret-gift/wrong.png";
import m1 from "@/assets/secret-gift/memory1.jpg";
import m2 from "@/assets/secret-gift/memory2.jpg";
import m3 from "@/assets/secret-gift/memory3.jpg";
import m4 from "@/assets/secret-gift/memory4.jpg";
import m5 from "@/assets/secret-gift/memory5.jpg";
import gardenCover from "@/assets/garden/cover.jpg";
import heartCover from "@/assets/heart/cover.jpg";

export const sweetMedia = { cat: sweetCat, cake: sweetCake, bunny: sweetBunny, party: sweetParty, song: sweetSong, photos: [sweet1, sweet2, sweet3], cover: sweet1 };
export const apologyMedia = { pleading: apologyPleading, corgi: apologyCorgi, crying: apologyCrying, begging: apologyBegging, love: apologyLove, cover: apologyLove };
export const secretMedia = { cover: secretCover, dance: secretDance, excited: secretExcited, gift: secretGift, pleading: secretPleading, wrong: secretWrong, memories: [m1, m2, m3, m4, m5] };
export const gardenMedia = { cover: gardenCover };
export const heartMedia = { cover: heartCover };

/** Category → presentation kind for the five uploaded templates. */
export const NEW_TEMPLATE_KINDS = {
  "sweet-birthday": "sweet",
  apology: "apology",
  "secret-birthday": "secret",
  garden: "garden",
  "heart-universe": "heart",
} as const;
export type NewTemplateKind = (typeof NEW_TEMPLATE_KINDS)[keyof typeof NEW_TEMPLATE_KINDS];

export function newTemplateKind(category: string): NewTemplateKind | null {
  return (NEW_TEMPLATE_KINDS as Record<string, NewTemplateKind>)[category.toLowerCase()] ?? null;
}

export function newTemplateCover(category: string): string | null {
  switch (newTemplateKind(category)) {
    case "sweet": return sweetMedia.cover;
    case "apology": return apologyMedia.cover;
    case "secret": return secretMedia.cover;
    case "garden": return gardenMedia.cover;
    case "heart": return heartMedia.cover;
    default: return null;
  }
}

export function newTemplateDemoPhotos(category: string): string[] | null {
  switch (newTemplateKind(category)) {
    case "sweet": return sweetMedia.photos;
    case "secret": return secretMedia.memories;
    default: return null;
  }
}

/** Default secret code for the Secret Birthday Gift keypad (the original template's code). */
export const DEFAULT_SECRET_PASSCODE = "2005";

/** Playful reveal only — never an access-control boundary. */
export function matchesSecretPasscode(entered: string, passcode: string | undefined) {
  return entered === (passcode && /^\d{4}$/.test(passcode) ? passcode : DEFAULT_SECRET_PASSCODE);
}

/** Garden message: up to 4 short lines, 140 characters, separated by "|". */
export function gardenMessage(message: string): string | undefined {
  const lines = message.split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 4).join("|");
  return lines && lines.length <= 140 ? lines : undefined;
}
