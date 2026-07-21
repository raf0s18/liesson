import { z } from "zod";

export const sentenceSchema = z.object({ id: z.string().min(1), text: z.string().min(1) });
export const plantedErrorSchema = z.object({
  sentence_id: z.string().min(1), error_tier: z.number().int().min(1).max(5),
  error_category: z.enum(["blatant_fact", "wrong_detail", "overgeneralization", "causal_mechanism", "plausible_misattribution"]),
  what_is_wrong: z.string(), correct_version: z.string(),
});
export const quizQuestionSchema = z.object({
  id: z.string(), question: z.string(), options: z.array(z.string()).min(2).max(4), correct_option_index: z.number().int(),
}).superRefine((value, ctx) => {
  if (value.correct_option_index < 0 || value.correct_option_index >= value.options.length) ctx.addIssue({ code: "custom", message: "Correct option must exist" });
});
export const lessonSchema = z.object({
  mode: z.enum(["lies", "no_lies_quiz"]), topic: z.string(), requested_difficulty_tier: z.number().int().min(1).max(5),
  served_difficulty_tier: z.number().int().min(1).max(5), title: z.string(), sentences: z.array(sentenceSchema).min(6).max(10),
  planted_errors: z.array(plantedErrorSchema).max(3), quiz_questions: z.array(quizQuestionSchema),
  safety_classification: z.object({ is_high_risk_topic: z.boolean(), risk_reason: z.string() }),
});
export type FullLesson = z.infer<typeof lessonSchema>;
export const publicLessonSchema = lessonSchema.omit({ planted_errors: true });
export type PublicLesson = z.infer<typeof publicLessonSchema>;

export const lessonRequestSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  difficultyTier: z.number().int().min(1).max(5),
  sourceMaterial: z.string().trim().min(1).max(3000).optional(),
  sentenceCount: z.union([z.literal(6), z.literal(8), z.literal(10)]),
});
export const flagSchema = z.object({ sentenceId: z.string().min(1), reason: z.string().trim().max(180).optional() });
export const adjudicateRequestSchema = z.object({ flags: z.array(flagSchema).max(10), quizAnswers: z.record(z.string(), z.number().int().min(0).max(3)).optional() });

export const adjudicationSchema = z.object({
  overall_score_percent: z.number().int().min(0).max(100),
  results: z.array(z.object({
    sentence_id: z.string(), was_planted_error: z.boolean(), user_flagged: z.boolean(),
    verdict: z.enum(["full_credit", "partial_credit", "miss", "false_accusation", "correct_pass"]),
    reasoning_feedback: z.string(), correct_version: z.string(),
  })), summary_explanation: z.string(),
});
export type Adjudication = z.infer<typeof adjudicationSchema>;

export const lessonResponseSchema = z.object({ lesson: publicLessonSchema });
export const adjudicateResponseSchema = z.object({ adjudication: adjudicationSchema, plantedErrors: z.array(plantedErrorSchema), mode: z.enum(["lies", "no_lies_quiz"]) });
