import cover from "@/assets/karwa/cover.jpg";
import moon from "@/assets/karwa/moon.jpg";
import thali from "@/assets/karwa/thali.jpg";
import mehendi from "@/assets/karwa/mehendi.jpg";
import chalni from "@/assets/karwa/chalni.jpg";
import diyas from "@/assets/karwa/diyas.jpg";
import couple1 from "@/assets/karwa/couple1.jpg";
import couple2 from "@/assets/karwa/couple2.jpg";
import songAsset from "@/assets/karwa2/song.mp3.asset.json";
import goldVideo from "@/assets/karwa2/gold.mp4.asset.json";
import moonVideo from "@/assets/karwa2/moon.mp4.asset.json";
import sieveVideo from "@/assets/karwa2/sieve.mp4.asset.json";
import p2 from "@/assets/karwa2/p191703.jpg.asset.json";

export const karwaMedia = {
  song: songAsset.url,
  cover, moon, chalni, diyas, thali, mehendi, couple1, couple2,
  videos: { gold: goldVideo.url, moon: moonVideo.url, sieve: sieveVideo.url },
  demoPhotos: [couple1, couple2, cover, p2.url],
};
