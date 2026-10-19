import { describe, expect, it } from "vitest";
import { matchesProposalSecret, proposalQuiz, canContinueProposalQuiz, scoreProposalQuiz, readProposalConfig } from "../lib/proposal";

describe("Proposal reveal", () => {
  it("uses the recipient's name for the playful secret", () => {
    expect(matchesProposalSecret(" jaan ", "Jaan")).toBe(true);
    expect(matchesProposalSecret("someone else", "Jaan")).toBe(false);
  });
  it("has an answer among the available choices for every question", () => {
    expect(proposalQuiz.map((q) => q.options[q.answer])).toEqual(["Right beside you", "Your smile", "You. Always you."]);
  });
  it("allows continuing with a wrong selected answer", () => {
    expect(canContinueProposalQuiz(0)).toBe(true);
    expect(canContinueProposalQuiz(null)).toBe(false);
  });
  it("scores the recipient's selections against the buyer's designated answers", () => {
    const quiz = [{ question: "Our first date?", options: ["Cafe", "Park"], answer: 1 }, { question: "Our song?", options: ["One", "Two"], answer: 0 }];
    expect(scoreProposalQuiz(quiz, [0, 0])).toBe(1);
    expect(scoreProposalQuiz(quiz, [1, 0])).toBe(2);
  });
  it("preserves buyer-created questions and their selected correct option", () => {
    expect(readProposalConfig({ quiz: [{ question: "Where?", options: ["Here", "There"], answer: 1 }] }).quiz?.[0]?.answer).toBe(1);
    expect(readProposalConfig({ quiz: [{ question: "Where?", options: ["Here", "There"], answer: 3 }] })).toEqual({});
  });
});