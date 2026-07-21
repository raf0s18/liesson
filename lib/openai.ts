import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import lessonFormat from "@/prompts/lesson-schema.json";
import adjudicationFormat from "@/prompts/adjudicator-schema.json";
import { adjudicationSchema, lessonSchema, type FullLesson } from "./schemas";

const client = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};
const prompt = (name: string) => readFile(path.join(process.cwd(), "prompts", name), "utf8");
async function structured<T>(instructions: string, input: string, format: { name: string; strict: boolean; schema: object }, parse: (value: unknown) => T): Promise<T> {
  const response = await client().responses.create({
    // Verify this model ID against the first funded production API response.
    model: "gpt-5.6-terra", instructions, input,
    text: { format: { type: "json_schema", name: format.name, strict: format.strict, schema: format.schema } as never },
  });
  if (!response.output_text) throw new Error("The model returned no structured output.");
  return parse(JSON.parse(response.output_text));
}
export async function generateLesson(topic: string, difficultyTier: number, forceNoLies: boolean) {
  const input = JSON.stringify({ topic, requested_difficulty_tier: difficultyTier, ...(forceNoLies ? { force_no_lies_quiz: true, note: "This topic matches the application's high-risk blocklist. Use no_lies_quiz mode." } : {}) });
  return structured(await prompt("lesson-system-prompt.txt"), input, lessonFormat, (value) => lessonSchema.parse(value));
}
export async function adjudicateLesson(lesson: FullLesson, flags: unknown) {
  const input = JSON.stringify({ lesson, learner_submission: { flags } });
  return structured(await prompt("adjudicator-system-prompt.txt"), input, adjudicationFormat, (value) => adjudicationSchema.parse(value));
}
