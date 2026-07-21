"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { PwaRegister } from "@/components/pwa-register";

const SOURCE_MATERIAL_KEY = "liesson-source-material";
const SENTENCE_COUNT_KEY = "liesson-sentence-count";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [sentenceCount, setSentenceCount] = useState<6 | 8 | 10>(8);
  const router = useRouter();

  const startLesson = (event: React.FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) return;
    sessionStorage.setItem(SOURCE_MATERIAL_KEY, sourceMaterial.trim());
    sessionStorage.setItem(SENTENCE_COUNT_KEY, String(sentenceCount));
    router.push(`/lesson?topic=${encodeURIComponent(topic.trim())}`);
  };

  return <main className="shell flex flex-col justify-center gap-8"><PwaRegister /><Onboarding /><div><p className="font-bold text-[var(--coral)] tracking-widest uppercase">A suspicious education app</p><h1 className="mt-2 text-5xl font-black leading-none">Liesson lies<br />to you.</h1><p className="mt-5 text-lg leading-relaxed">Every lesson has a few planted errors. Tap the claims that do not belong, then learn the truth.</p></div><form className="card p-5" onSubmit={startLesson}><label className="font-bold" htmlFor="topic">What do you want to learn?</label><input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. photosynthesis" className="mt-3 w-full rounded-xl border-2 border-[var(--ink)] p-3" /><label className="mt-5 block font-bold" htmlFor="sentence-count">Lesson length</label><select id="sentence-count" value={sentenceCount} onChange={(event) => setSentenceCount(Number(event.target.value) as 6 | 8 | 10)} className="mt-2 w-full rounded-xl border-2 border-[var(--ink)] bg-white p-3"><option value={6}>Quick · 6 sentences</option><option value={8}>Standard · 8 sentences</option><option value={10}>Deep dive · 10 sentences</option></select><label className="mt-5 block font-bold" htmlFor="source-material">Paste your own material <span className="font-normal">(optional)</span></label><textarea id="source-material" value={sourceMaterial} onChange={(event) => setSourceMaterial(event.target.value.slice(0, 3000))} maxLength={3000} rows={5} placeholder="Paste a passage, class notes, or other teacher-supplied material…" className="mt-2 w-full resize-y rounded-xl border-2 border-[var(--ink)] p-3" /><p className="mt-1 text-right text-sm" aria-live="polite">{sourceMaterial.length}/3000</p><button className="button mt-4 w-full" type="submit">Try a lesson →</button><p className="mt-3 text-sm">No account. Your difficulty adapts on this device.</p></form></main>;
}
