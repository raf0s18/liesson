"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const KEY = "liesson-onboarding-seen";
export function Onboarding() {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(!localStorage.getItem(KEY)), []);
  const close = () => { localStorage.setItem(KEY, "1"); setOpen(false); };
  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-4 sm:place-items-center"><motion.section initial={{ y: 40, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }} className="card w-full max-w-md p-6"><p className="font-bold tracking-widest text-[var(--coral)]">HOW IT WORKS</p><h2 className="mt-2 text-3xl font-black">This app lies to you — catch it.</h2><p className="mt-4 leading-relaxed">Each short lesson hides a few deliberate errors among accurate facts. Tap any sentence that feels suspicious, tell us why if you can, and we’ll reveal every correction.</p><button className="button mt-6 w-full" onClick={close}>I&apos;m ready to investigate</button></motion.section></motion.div>}</AnimatePresence>;
}
