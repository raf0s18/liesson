# Liesson — the education app that lies to you

> Every lesson contains deliberate mistakes. You learn by catching them.

**Demo video:** https://youtu.be/YOUR_VIDEO_ID
**Track:** Education

---

## How it works

1. **Pick any topic** — "photosynthesis", "the French Revolution", "Rust ownership", anything.
2. **Read a 60-second lesson** written by GPT-5.6 that is *mostly* true.
3. **Tap the sentences you think are lies.** Confidence slider optional.
4. **Get adjudicated.** GPT-5.6 reveals each planted mistake, scores your catches (including partial credit for "right sentence, wrong reason"), and explains the true version.
5. **The difficulty adapts.** Catch everything and the next lesson's lies get subtler — from flat-out wrong facts, to swapped causes and effects, to plausible-sounding misattributions and off-by-one-era dates.

## What's unique

Learning-science research consistently shows that error detection and correction ("erroneous examples") produces deeper encoding than studying correct material — but no consumer app has ever made *the lie itself* the core mechanic. Liesson isn't a quiz app with distractors; the entire lesson is the test, and reading it adversarially is the point. This mechanic is only possible now: it requires a model that can generate *calibrated, pedagogically useful* falsehoods on any topic on demand, grade free-form justifications, and never lose track of which statements were the planted lies. That's the GPT-5.6 layer, and it's irreplaceable — not incidental.

## Built with

`typescript` `react` `nextjs` `tailwindcss` `nodejs` `vercel` `vercel-kv` `openai-api` `gpt-5.6` `responses-api` `codex` `structured-outputs` `zod` `pwa` `vitest` `playwright` `framer-motion`

## How Codex was used

Codex was the primary engineering agent for this project:

- **Scaffolding and core flow:** built the Next.js 15 App Router application, landing page, mobile lesson player, tappable sentence flags, results view, PWA manifest, and service worker.
- **GPT-5.6 integration:** implemented both OpenAI Responses API routes with the supplied system prompts and strict Structured Output schemas. It keeps `planted_errors` off the client in an AES-GCM encrypted, httpOnly lesson cookie.
- **Safety and adaptation:** added Zod validation at every API boundary, a medical/legal/safety topic blocklist that switches to an accurate no-lies quiz, and anonymous local difficulty tiers that move up or down from results.
- **Demo polish:** added Framer Motion flag and reveal transitions, a first-visit onboarding overlay, staged GPT-5.6 generation/scoring states, persistent local streaks, and friendly retry-safe API errors.
- **Verification and deploy setup:** wrote Vitest adaptive-scoring tests and a Playwright anonymous lesson-loop test, resolved build/type issues, added `vercel.json`, and verified the production build.
- **Public-demo safeguards:** selected the GPT-5.6 Terra runtime model and added Vercel KV sliding-window visitor limits plus a shared daily model-call budget before either OpenAI route can run.

Primary build session: `/feedback` Codex Session ID — `019f848a-f86d-7892-8c1e-cf243568c284`

## How GPT-5.6 was used

GPT-5.6 is the product, not a garnish:

- **Lesson generation:** writes each micro-lesson with planted errors, constrained by a Structured Outputs JSON schema so the app always knows exactly which sentences are lies and why.
- **Calibration:** receives the user's difficulty state and plants lies at the matching subtlety tier — a beginner gets "the mitochondria produces sunlight", an expert gets a subtly inverted causal chain.
- **Adjudication:** grades the user's flagged sentences *and their stated reasoning*, awarding partial credit and generating the corrective explanation.

Every one of these is a live API call at runtime — GPT-5.6 isn't consulted once during planning, it's in the critical path of every lesson served.

## Safety: lying responsibly

Planted errors are always revealed and corrected at the end of every lesson — the app never lets a lie stand. Topics matching a medical/legal/safety blocklist route to a "no-lies mode" (straight quiz) instead. Every lesson footer shows "This lesson contained N deliberate errors, all corrected above."

