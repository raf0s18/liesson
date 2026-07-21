# Liesson — 3-minute demo video script

## 0:00–0:20 — The hook

**On screen:** Liesson landing page. Let the onboarding overlay appear.

**Voiceover:**

"Most education apps teach you facts. Liesson does something more active: it lies to you—carefully—and asks you to catch the lies. Every micro-lesson is mostly accurate, with one to three deliberate errors hidden inside."

**Action:** Click “I’m ready to investigate,” type `photosynthesis`, then click “Try a lesson.”

## 0:20–0:55 — The working learning loop

**On screen:** The animated GPT-5.6 lesson-generation state, then the lesson.

**Voiceover:**

"There is no login. Liesson remembers an anonymous learner’s difficulty tier in local storage. While GPT-5.6 creates the lesson, the app shows the generation stages. When it’s ready, I read each tappable sentence like a skeptical student."

**Action:** Tap a suspicious non-adjacent sentence; show the animated reason field. Enter a concise reason. Optionally flag a second sentence, then submit.

## 0:55–1:30 — GPT-5.6 is in the product loop

**On screen:** Scoring/loading state, then results and revealed corrections.

**Voiceover:**

"GPT-5.6 is not a decorative feature here. The lesson route calls the OpenAI Responses API with Structured Outputs, using a strict schema. The model writes the lesson, records every planted error, and that ground truth stays in an encrypted, httpOnly cookie—not in the browser."

"On submission, the adjudication route sends the full lesson and my flags back to GPT-5.6. It can award full or partial credit based on whether my explanation is sound, penalize false accusations, and write the corrective explanation you see here."

**Action:** Point at the score, a “Lie revealed” card, and the footer confirming every deliberate error was corrected.

## 1:30–1:55 — Safety and adaptation

**On screen:** Start another lesson or briefly show a blocked topic such as `CPR` entering no-lies quiz mode. Show the streak and tier badge.

**Voiceover:**

"Liesson never plants misinformation for medical, legal, or safety-sensitive topics. Those switch to an accurate no-lies quiz instead. For regular subjects, high scores raise the next error-subtlety tier; misses lower it. A streak counter makes the practice loop feel like a daily challenge."

## 1:55–2:35 — How Codex built it

**On screen:** Editor with `app/api/lesson/route.ts`, `app/api/adjudicate/route.ts`, `lib/session.ts`, then `app/lesson/page.tsx` and `tests/scoring.test.ts`.

**Voiceover:**

"I used Codex as the primary engineering agent. It scaffolded this Next.js 15 App Router application, connected the Responses API and the supplied strict schemas, built encrypted session handling, Zod validation, the PWA shell, and the mobile lesson interface."

"Codex also added the Framer Motion interactions, onboarding, resilient error states, Vercel configuration, and automated checks: Vitest verifies adaptive scoring and Playwright verifies the complete anonymous lesson loop."

## 2:35–3:00 — Close

**On screen:** Back on a polished results page, then landing page.

**Voiceover:**

"Liesson turns passive reading into active error detection: notice the claim, explain what is wrong, and immediately see the correction. GPT-5.6 generates the challenge and provides the feedback loop; Codex built the product around it. Try a lesson and catch the lie."
