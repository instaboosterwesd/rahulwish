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
  { question: "What is my favourite Diwali sweet?", options: ["Kaju katli", "Gulab jamun", "Laddoo"], answer: 0 },
  { question: "Where did we celebrate our first Diwali together?", options: ["At home", "With friends", "On a trip"], answer: 0 },
  { question: "What do I want most this Diwali?", options: ["New clothes", "Fireworks", "Just you"], answer: 2 },
];
