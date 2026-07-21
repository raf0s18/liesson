import { describe, expect, it } from "vitest";
import { lessonRequestSchema } from "@/lib/schemas";

describe("lesson request validation", () => {
  it("accepts teacher-supplied source material", () => {
    expect(lessonRequestSchema.safeParse({ topic: "Plant life", difficultyTier: 3, sentenceCount: 8, sourceMaterial: "Plants use light to make sugars from water and carbon dioxide." }).success).toBe(true);
  });

  it("rejects source material over 3,000 characters", () => {
    expect(lessonRequestSchema.safeParse({ topic: "Plant life", difficultyTier: 3, sentenceCount: 8, sourceMaterial: "x".repeat(3001) }).success).toBe(false);
  });
});
