import { describe, expect, it } from "vitest";
import { matchesProposalSecret, proposalQuiz } from "../lib/proposal";

describe("Proposal reveal", () => {
  it("uses the recipient's name for the playful secret", () => {
    expect(matchesProposalSecret(" jaan ", "Jaan")).toBe(true);
    expect(matchesProposalSecret("someone else", "Jaan")).toBe(false);
  });
  it("has an answer among the available choices for every question", () => {
    expect(proposalQuiz.map((q) => q.options[q.answer])).toEqual(["Right beside you", "Your smile", "You. Always you."]);
  });
});