import cover from "@/assets/diwali/cover.jpg";
import diya from "@/assets/diwali/diya.jpg";
import fireworks from "@/assets/diwali/fireworks.jpg";
import sweets from "@/assets/diwali/sweets.jpg";
import couple1 from "@/assets/karwa/couple1.jpg";
import couple2 from "@/assets/karwa/couple2.jpg";
import { uploadedMedia } from "@/lib/uploaded-templates";

export const diwaliMedia = {
  cover, diya, fireworks, sweets,
  get song() { return uploadedMedia.giftSong; },
  demoPhotos: [couple1, couple2, cover, sweets],
};

export const diwaliQuiz = [
  { question: "Diwali par meri favourite mithai kaunsi hai?", options: ["Kaju katli", "Gulab jamun", "Laddoo"], answer: 0 },
  { question: "Hamari pehli Diwali saath mein kahan mani thi?", options: ["Ghar par", "Dosto ke saath", "Ghoomne gaye the"], answer: 0 },
  { question: "Is Diwali mujhe sabse zyada kya chahiye?", options: ["Naye kapde", "Patakhe", "Bas tum"], answer: 2 },
];
