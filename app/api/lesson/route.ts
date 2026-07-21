import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateLesson } from "@/lib/openai";
import { lessonRequestSchema, lessonResponseSchema } from "@/lib/schemas";
import { isBlockedTopic } from "@/lib/safety";
import { saveLesson } from "@/lib/session";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = lessonRequestSchema.parse(await request.json());
    const lesson = await generateLesson(body.topic, body.difficultyTier, isBlockedTopic(body.topic));
    await saveLesson(lesson);
    return NextResponse.json(lessonResponseSchema.parse({ lesson: { ...lesson, planted_errors: undefined } }));
  } catch (error) {
    const isConfigurationIssue = error instanceof Error && error.message.includes("OPENAI_API_KEY");
    const message = error instanceof ZodError ? "We received an invalid lesson request. Please choose another topic." : isConfigurationIssue ? "Lesson generation is temporarily unavailable. Please try again soon." : "We couldn’t create that lesson. Please try again.";
    return NextResponse.json({ error: message }, { status: isConfigurationIssue ? 503 : 400 });
  }
}
