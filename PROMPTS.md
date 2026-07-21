# Prompts to run the actual build through Codex + GPT-5.6

Run these in order. Prompt 1 is internal planning only, run with Claude
(Fable 5) — it's design/ideation scratch work, not part of the shipped
product, so it must NOT be cited anywhere in the README as GPT-5.6 usage.
Prompts 2–4 go to Codex (CLI or IDE — keep them in ONE thread so it counts as
your "primary build thread", then run `/feedback` in that thread to get the
Session ID the submission form requires). GPT-5.6 enters the picture for
real starting in Prompt 2, where it's called via the OpenAI API at runtime
to actually generate and adjudicate lessons — that's the meaningful,
non-decorative use the hackathon rules require.

---

## Prompt 1 — Fable 5 (Claude): design the lie engine (internal planning — do not attribute to GPT-5.6)

> I'm building "Liesson", an education app where every 60-second micro-lesson
> contains 1–3 deliberately planted errors and the learner scores points by
> catching them. Help me design the "lie engine":
>
> 1. A 5-tier taxonomy of error subtlety, from tier 1 (blatantly wrong fact)
>    to tier 5 (subtly inverted causal chain or plausible misattribution),
>    with 2 concrete examples per tier for the topic "photosynthesis".
> 2. A production system prompt for GPT-5.6 that generates a lesson as JSON:
>    { title, sentences: [{id, text}], planted_errors: [{sentence_id,
>    error_tier, what_is_wrong, correct_version}], difficulty_state }.
>    It must never plant errors on medical dosage, legal advice, or safety
>    instructions — those topics fall back to "no-lies quiz mode".
> 3. A second system prompt for the adjudicator call: given the lesson JSON and
>    the user's flagged sentence ids + free-text reasons, score each flag
>    (full / partial / miss), and write a corrective explanation.
> 4. Red-team your own prompts: list 5 ways this could accidentally teach
>    misinformation, and add mitigations to the prompts.
>
> Iterate with me until the JSON schema is airtight, then output the final
> versions of both system prompts in copy-paste-ready code blocks.

Save the two system prompts it produces — you'll paste them into Prompt 2.
This step just gets you a better first draft to hand to Codex; it isn't OpenAI
tooling and shouldn't be described as such in the submission.

---

## Prompt 2 — Codex: scaffold the app

> Create a new Next.js 15 (App Router, TypeScript, Tailwind) project called
> "liesson" — an education PWA where every lesson contains deliberate planted
> errors the user must catch. Build:
>
> 1. `/` landing page: topic input + "Try a lesson" (anonymous, no login).
> 2. `/lesson` page: renders a lesson as tappable sentences; user flags
>    suspected lies, optionally adds a one-line reason per flag, then submits.
> 3. API route `POST /api/lesson` — calls the OpenAI Responses API
>    (model: gpt-5.6) with Structured Outputs. Read
>    `prompts/lesson-system-prompt.txt` for the system prompt and
>    `prompts/lesson-schema.json` for the Structured Outputs response schema —
>    use them as-is. Strip `planted_errors` before sending the lesson to the
>    client; keep it server-side in an encrypted httpOnly session cookie or
>    Supabase row.
> 4. API route `POST /api/adjudicate` — sends lesson + user flags to gpt-5.6.
>    Read `prompts/adjudicator-system-prompt.txt` for the system prompt and
>    `prompts/adjudicator-schema.json` for the response schema — use them
>    as-is. Returns scores, reveals all planted errors, and a corrective
>    explanation.
> 5. Results screen: score, each lie revealed with its correction, and a
>    footer: "This lesson contained N deliberate errors, all corrected above."
> 6. Adaptive difficulty: store an error-subtlety tier (1–5) per anonymous
>    session in localStorage, raise it on high scores, lower it on misses,
>    and pass it into the lesson prompt.
> 7. PWA manifest + service worker, mobile-first design, Zod validation on
>    every API boundary, and a topic blocklist (medical/legal/safety) that
>    switches to no-lies quiz mode.
>
> Use env var OPENAI_API_KEY. Add an .env.example. Make `npm run dev` work
> end to end, then write Vitest tests for the scoring logic and one
> Playwright test for the full lesson loop.

---

## Prompt 3 — Codex: polish + deploy

> Polish Liesson for a public hackathon demo: add Framer Motion transitions
> on flag/reveal, a streak counter, an onboarding overlay explaining "this app
> lies to you — catch it", loading/streaming states while gpt-5.6 writes the
> lesson, and graceful error handling on all API calls. Then set up deployment
> to Vercel (vercel.json if needed), verify the production build passes, and
> give me the exact commands to deploy and the checklist of env vars to set
> in the Vercel dashboard.

---

## Prompt 4 — Codex: submission collateral

> Review the README.md in this repo (already written). Update the "How Codex
> was used" section so it accurately reflects everything you actually did in
> this thread, fill in the real repo URL and deploy URL, and generate a
> 3-minute demo-video script with voiceover beats that show: (1) the working
> app, (2) where gpt-5.6 generates and adjudicates lessons, (3) how Codex
> built the project.

Then run `/feedback` in this same Codex thread, copy the Session ID into the
README and the Devpost form.

---

## Submission checklist (deadline: TODAY July 21, 5:00 PM PDT)

- [ ] Codex Session ID from `/feedback` pasted into form + README
- [ ] Public repo pushed (GitHub), README filled in
- [ ] Vercel demo URL live and working logged-out
- [ ] ≤3-min YouTube video, public, with voiceover
- [ ] Track selected: Education
