import type { Adjudication } from "./schemas";

export function nextDifficulty(current: number, adjudication: Adjudication): number {
  const hasErrors = adjudication.results.some((result) => result.was_planted_error);
  if (!hasErrors) return current;
  if (adjudication.overall_score_percent >= 80) return Math.min(5, current + 1);
  if (adjudication.overall_score_percent < 50) return Math.max(1, current - 1);
  return current;
}
