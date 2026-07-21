import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { adjudicateLesson } from "@/lib/openai";
import { adjudicateRequestSchema, adjudicateResponseSchema, type Adjudication } from "@/lib/schemas";
import { clearLesson, getLesson } from "@/lib/session";

export const runtime = "nodejs";
function quizAdjudication(lesson: NonNullable<Awaited<ReturnType<typeof getLesson>>>, answers: Record<string, number>): Adjudication {
  const total = lesson.quiz_questions.length;
  const correct = lesson.quiz_questions.filter((question) => answers[question.id] === question.correct_option_index).length;
  return { overall_score_percent: total ? Math.round((correct / total) * 100) : 0, results: lesson.sentences.map((sentence) => ({ sentence_id: sentence.id, was_planted_error: false, user_flagged: false, verdict: "correct_pass", reasoning_feedback: "This lesson is presented in no-lies quiz mode.", correct_version: sentence.text })), summary_explanation: `You answered ${correct} of ${total} comprehension questions correctly. This high-risk topic was taught in no-lies quiz mode, so every lesson sentence was accurate.` };
}
export async function POST(request: Request) {
  try {
    const submission = adjudicateRequestSchema.parse(await request.json());
    const lesson = await getLesson();
    if (!lesson) return NextResponse.json({ error: "Your lesson session expired. Please start a new lesson." }, { status: 401 });
    const ids = new Set(lesson.sentences.map((sentence) => sentence.id));
    if (submission.flags.some((flag) => !ids.has(flag.sentenceId))) return NextResponse.json({ error: "A flagged sentence does not belong to this lesson." }, { status: 400 });
    const adjudication = lesson.mode === "no_lies_quiz" ? quizAdjudication(lesson, submission.quizAnswers ?? {}) : await adjudicateLesson(lesson, submission.flags);
    const response = adjudicateResponseSchema.parse({ adjudication, plantedErrors: lesson.planted_errors, mode: lesson.mode });
    await clearLesson();
    return NextResponse.json(response);
  } catch (error) {
    const isConfigurationIssue = error instanceof Error && error.message.includes("OPENAI_API_KEY");
    const message = error instanceof ZodError ? "We couldn’t understand that submission. Please retry." : isConfigurationIssue ? "Scoring is temporarily unavailable. Please try again soon." : "We couldn’t score that lesson. Please try again.";
    return NextResponse.json({ error: message }, { status: isConfigurationIssue ? 503 : 400 });
  }
}
