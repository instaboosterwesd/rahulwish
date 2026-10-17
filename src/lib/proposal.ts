export const proposalChapters = ["A little secret", "Just for you", "Our little world", "From my heart", "How well do you know us?", "Our memories", "Why you", "Our tomorrows", "Almost there", "A promise", "One question", "Our forever"];

// This is a playful reveal, not authentication or protection for private data.
export function matchesProposalSecret(value: string, recipient: string) {
  return value.trim().toLocaleLowerCase() === recipient.trim().toLocaleLowerCase();
}

export const proposalQuiz = [
  { question: "Where is my favourite place?", options: ["By the sea", "Right beside you", "Somewhere far away"], answer: 1 },
  { question: "What makes an ordinary day special?", options: ["Your smile", "A perfect plan", "The weather"], answer: 0 },
  { question: "Who do I want in every tomorrow?", options: ["Someone else", "I haven’t decided", "You. Always you."], answer: 2 },
];