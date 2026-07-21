"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { PwaRegister } from "@/components/pwa-register";
import { MAX_SOURCE_MATERIAL_CHARS, MAX_UPLOAD_BYTES, truncateSourceMaterial } from "@/lib/file-extract";

const SOURCE_MATERIAL_KEY = "liesson-source-material";
const SENTENCE_COUNT_KEY = "liesson-sentence-count";

async function extractText(file: File): Promise<string> {
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) return file.text();
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n").trim();
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [sentenceCount, setSentenceCount] = useState<6 | 8 | 10>(8);
  const [fileError, setFileError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const router = useRouter();

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFileError("");
    if (!/\.(pdf|txt)$/i.test(file.name)) { setFileError("Please upload a .pdf or .txt file."); return; }
    if (file.size > MAX_UPLOAD_BYTES) { setFileError("That file is over 5MB. Please upload something smaller."); return; }
    setExtracting(true);
    try {
      const raw = await extractText(file);
      if (!raw.trim()) { setFileError("We couldn't find any text in that file — it may be a scanned or image-only document."); return; }
      const { text, truncated } = truncateSourceMaterial(raw);
      setSourceMaterial(text);
      setFileError(truncated ? `Only the first ${MAX_SOURCE_MATERIAL_CHARS.toLocaleString()} characters were kept.` : "");
    } catch { setFileError("We couldn't read that file. Please try another, or paste the text directly."); }
    finally { setExtracting(false); }
  };

  const startLesson = (event: React.FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) return;
    sessionStorage.setItem(SOURCE_MATERIAL_KEY, sourceMaterial.trim());
    sessionStorage.setItem(SENTENCE_COUNT_KEY, String(sentenceCount));
    router.push(`/lesson?topic=${encodeURIComponent(topic.trim())}`);
  };

  return <main className="shell flex flex-col justify-center gap-8"><PwaRegister /><Onboarding /><div><p className="font-bold text-[var(--coral)] tracking-widest uppercase">A suspicious education app</p><h1 className="mt-2 text-5xl font-black leading-none">Liesson lies<br />to you.</h1><p className="mt-5 text-lg leading-relaxed">Every lesson has a few planted errors. Tap the claims that do not belong, then learn the truth.</p></div><form className="card p-5" onSubmit={startLesson}><label className="font-bold" htmlFor="topic">What do you want to learn?</label><input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. photosynthesis" className="mt-3 w-full rounded-xl border-2 border-[var(--ink)] p-3" /><label className="mt-5 block font-bold" htmlFor="sentence-count">Lesson length</label><select id="sentence-count" value={sentenceCount} onChange={(event) => setSentenceCount(Number(event.target.value) as 6 | 8 | 10)} className="mt-2 w-full rounded-xl border-2 border-[var(--ink)] bg-white p-3"><option value={6}>Quick · 6 sentences</option><option value={8}>Standard · 8 sentences</option><option value={10}>Deep dive · 10 sentences</option></select><label className="mt-5 block font-bold" htmlFor="source-material">Paste your own material <span className="font-normal">(optional)</span></label><label htmlFor="source-file" className="mt-2 block cursor-pointer rounded-xl border-2 border-dashed border-[var(--ink)]/40 p-3 text-center text-sm font-bold">{extracting ? "Reading file…" : "Upload a .pdf or .txt file"}</label><input id="source-file" type="file" accept=".pdf,.txt,text/plain,application/pdf" onChange={handleFile} className="sr-only" disabled={extracting} />{fileError && <p role="alert" className="mt-2 text-sm text-[var(--coral)]">{fileError}</p>}<textarea id="source-material" value={sourceMaterial} onChange={(event) => setSourceMaterial(event.target.value.slice(0, MAX_SOURCE_MATERIAL_CHARS))} maxLength={MAX_SOURCE_MATERIAL_CHARS} rows={5} placeholder="…or paste a passage, class notes, or other teacher-supplied material" className="mt-2 w-full resize-y rounded-xl border-2 border-[var(--ink)] p-3" /><p className="mt-1 text-right text-sm" aria-live="polite">{sourceMaterial.length}/{MAX_SOURCE_MATERIAL_CHARS}</p><button className="button mt-4 w-full" type="submit">Try a lesson →</button><p className="mt-3 text-sm">No account. Your difficulty adapts on this device.</p></form></main>;
}
