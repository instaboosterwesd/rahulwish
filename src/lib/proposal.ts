export const proposalChapters = ["A little secret", "Just for you", "Our little world", "From my heart", "How well do you know us?", "Our memories", "Why you", "Our tomorrows", "Almost there", "A promise", "One question", "Our forever"];

// This is a playful reveal, not authentication or protection for private data.
export function matchesProposalSecret(value: string, recipient: string) {
  return value.trim().toLocaleLowerCase() === recipient.trim().toLocaleLowerCase();
}

import { z } from "zod";

export const proposalQuestionSchema = z.object({ question: z.string().trim().min(1).max(300), options: z.array(z.string().trim().min(1).max(200)).min(2).max(4), answer: z.number().int().min(0).max(3) }).refine((q) => q.answer < q.options.length, "Choose a correct option");
export const proposalConfigSchema = z.object({ quiz: z.array(proposalQuestionSchema).min(1).max(10).optional(), audioPath: z.string().max(200).optional(), audioName: z.string().max(200).optional() });
export type ProposalQuestion = z.infer<typeof proposalQuestionSchema>;
export type ProposalConfig = z.infer<typeof proposalConfigSchema>;
export function readProposalConfig(value: unknown): ProposalConfig { const parsed = proposalConfigSchema.safeParse(value); return parsed.success ? parsed.data : {}; }
export function scoreProposalQuiz(questions: ProposalQuestion[], answers: (number | null)[]) { return questions.reduce((total, q, i) => total + (answers[i] === q.answer ? 1 : 0), 0); }
export function canContinueProposalQuiz(answer: number | null) { return answer !== null; }

export const proposalQuiz: ProposalQuestion[] = [
  { question: "Where is my favourite place?", options: ["By the sea", "Right beside you", "Somewhere far away"], answer: 1 },
  { question: "What makes an ordinary day special?", options: ["Your smile", "A perfect plan", "The weather"], answer: 0 },
  { question: "Who do I want in every tomorrow?", options: ["Someone else", "I haven’t decided", "You. Always you."], answer: 2 },
];