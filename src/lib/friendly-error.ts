// Turns low-level server/connection errors into a short message a customer can understand.
export const GENERIC_ACTION_ERROR = "Something went wrong. Please try again in a moment.";

const TECHNICAL = /environment variable|unauthori[sz]ed|jwt|failed to fetch|fetch failed|networkerror|invalid database path|\[object/i;

export function friendlyActionError(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!message || TECHNICAL.test(message)) return GENERIC_ACTION_ERROR;
  return message;
}
