"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { adjudicateResponseSchema, lessonResponseSchema, type PublicLesson } from "@/lib/schemas";
import { nextDifficulty } from "@/lib/scoring";

const TIER = "liesson-difficulty-tier";
const STREAK = "liesson-streak";
const SOURCE_MATERIAL_KEY = "liesson-source-material";
const SENTENCE_COUNT_KEY = "liesson-sentence-count";
const tier = () => Math.max(1, Math.min(5, Number(localStorage.getItem(TIER) || 1)));
const messageFor = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const responseMessage = (response: Response, body: { error?: string; message?: string }, fallback: string) => response.status === 429 ? body.message || fallback : body.error || fallback;

function LessonPlayer() {
  const topic = useSearchParams().get("topic") || "photosynthesis";
  const [lesson, setLesson] = useState<PublicLesson | null>(null);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("GPT-5.6 is outlining your lesson…");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof adjudicateResponseSchema.parse> | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(Number(localStorage.getItem(STREAK) || 0));
    const steps = ["GPT-5.6 is outlining your lesson…", "Checking the facts it will keep true…", "Planting mistakes at your difficulty tier…"];
    let index = 0;
    const timer = window.setInterval(() => { index = Math.min(index + 1, steps.length - 1); setPhase(steps[index]); }, 1300);
    (async () => {
      try {
        const sourceMaterial = sessionStorage.getItem(SOURCE_MATERIAL_KEY)?.trim() || undefined;
        const savedCount = Number(sessionStorage.getItem(SENTENCE_COUNT_KEY));
        const sentenceCount = savedCount === 6 || savedCount === 10 ? savedCount : 8;
        const response = await fetch("/api/lesson", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic, difficultyTier: tier(), sourceMaterial, sentenceCount }) });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(responseMessage(response, body, "We couldn’t create that lesson. Please try again."));
        setLesson(lessonResponseSchema.parse(body).lesson);
      } catch (caught) { setError(messageFor(caught, "We couldn’t create that lesson. Please try again.")); }
      finally { window.clearInterval(timer); setLoading(false); }
    })();
    return () => window.clearInterval(timer);
  }, [topic]);

  const submit = async () => {
    if (!lesson) return;
    setLoading(true); setPhase("GPT-5.6 is reviewing your catches…"); setError("");
    try {
      const response = await fetch("/api/adjudicate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ flags: Object.entries(flags).map(([sentenceId, reason]) => ({ sentenceId, reason: reason || undefined })), quizAnswers: answers }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseMessage(response, body, "We couldn’t score that lesson. Your choices are still here—please retry."));
      const parsed = adjudicateResponseSchema.parse(body);
      setResult(parsed);
      localStorage.setItem(TIER, String(nextDifficulty(tier(), parsed.adjudication)));
      const nextStreak = parsed.adjudication.overall_score_percent >= 80 ? streak + 1 : 0;
      localStorage.setItem(STREAK, String(nextStreak)); setStreak(nextStreak);
    } catch (caught) { setError(messageFor(caught, "We couldn’t score that lesson. Please retry.")); }
    finally { setLoading(false); }
  };

  if (result) return <main className="shell"><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><p className="font-bold text-[var(--coral)]">RESULTS · {streak} 🔥 STREAK</p><h1 className="mt-1 text-4xl font-black">{result.adjudication.overall_score_percent}% caught</h1><p className="mt-4 rounded-xl bg-[var(--mint)] p-4 leading-relaxed">{result.adjudication.summary_explanation}</p></motion.div><section className="mt-6 space-y-3">{result.plantedErrors.map((item, index) => <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .12 }} className="card p-4" key={item.sentence_id}><p className="font-bold text-[var(--coral)]">Lie revealed</p><p className="mt-2"><b>Correction:</b> {item.correct_version}</p></motion.article>)}</section><footer className="mt-8 text-center text-sm">This lesson contained {result.plantedErrors.length} deliberate {result.plantedErrors.length === 1 ? "error" : "errors"}, all corrected above.</footer><a className="button mt-5 block text-center" href="/">Try another topic</a></main>;
  if (loading && !lesson) return <main className="shell flex min-h-screen items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }} className="mx-auto mb-5 h-10 w-10 rounded-full border-4 border-[var(--ink)] border-t-[var(--coral)]" /><p className="text-xl font-bold">{phase}</p><p className="mt-2 text-sm">This usually takes a few seconds.</p></motion.div></main>;
  if (!lesson) return <main className="shell"><h1 className="text-3xl font-black">Lesson unavailable</h1><p role="alert" className="mt-3 leading-relaxed">{error}</p><a className="button mt-6 inline-block" href="/">Back home</a></main>;
  const lies = lesson.mode === "lies";
  return <main className="shell"><div className="flex items-start justify-between gap-3"><p className="font-bold text-[var(--coral)]">{lies ? `TIER ${lesson.served_difficulty_tier} · FIND THE LIES` : "NO-LIES QUIZ MODE"}</p><p className="rounded-full border-2 border-[var(--ink)] bg-white px-3 py-1 text-sm font-bold">{streak} 🔥</p></div><h1 className="mt-1 text-4xl font-black">{lesson.title}</h1><p className="mt-3 leading-relaxed">{lies ? "Tap any sentence you suspect. Add a reason if you can — it earns more credit." : "This topic is safer as an all-accurate lesson. Check your understanding below."}</p><section className="mt-6 space-y-3">{lesson.sentences.map((sentence, index) => <motion.div layout key={sentence.id}>{lies ? <><motion.button whileTap={{ scale: .98 }} animate={{ x: sentence.id in flags ? 3 : 0 }} aria-pressed={sentence.id in flags} data-flagged={sentence.id in flags} className="sentence" onClick={() => setFlags((current) => { const next = { ...current }; if (sentence.id in next) delete next[sentence.id]; else next[sentence.id] = ""; return next; })}><span className="mr-2 font-black text-[var(--coral)]">{index + 1}.</span>{sentence.text}</motion.button><AnimatePresence>{sentence.id in flags && <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} aria-label={`Reason for sentence ${index + 1}`} className="reason mt-2" maxLength={180} placeholder="Why does this seem wrong? (optional)" value={flags[sentence.id]} onChange={(event) => setFlags((current) => ({ ...current, [sentence.id]: event.target.value }))} />}</AnimatePresence></> : <p className="sentence"><b className="mr-2 text-[var(--coral)]">{index + 1}.</b>{sentence.text}</p>}</motion.div>)}</section>{!lies && <section className="mt-7 space-y-5">{lesson.quiz_questions.map((question) => <fieldset key={question.id}><legend className="font-bold">{question.question}</legend>{question.options.map((option, index) => <label className="mt-2 flex gap-2" key={option}><input type="radio" name={question.id} checked={answers[question.id] === index} onChange={() => setAnswers((old) => ({ ...old, [question.id]: index }))} />{option}</label>)}</fieldset>)}</section>}<button className="button mt-8 w-full" disabled={loading} onClick={submit}>{loading ? phase : lies ? "Submit my catches" : "Check my answers"}</button>{error && <div role="alert" className="mt-4 rounded-xl border-2 border-red-700 bg-red-50 p-3 text-red-800"><p>{error}</p><button className="mt-2 font-bold underline" onClick={submit}>Try scoring again</button></div>}</main>;
}

export default function LessonPage() { return <Suspense fallback={<main className="shell">Loading lesson…</main>}><LessonPlayer /></Suspense>; }
