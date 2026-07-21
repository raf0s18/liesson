# Liesson — 3-minute demo video script

Record against https://liesson.vercel.app. Timings are targets, not
hard cuts — pace to how you actually talk, but don't let any section run
long; the "How Codex was used" and "How GPT-5.6 was used" sections are
the two the judges are explicitly scoring, so protect that time over the
cold open.

---

## 0:00–0:15 — The hook

**On screen:** Liesson landing page, onboarding overlay visible.

**Voiceover:**

"Every education app teaches by telling you true things. Liesson does
the opposite — it serves you a short lesson that's *mostly* true, hides
one to three deliberate errors inside it, and you learn by catching the
lies. Reading it adversarially is the whole mechanic."

---

## 0:15–0:40 — The core loop, fast

**On screen:** Dismiss onboarding, type "photosynthesis," hit "Try a
lesson." Let the generation loading state show briefly.

**Voiceover:**

"Type any topic. GPT-5.6 writes a real lesson — here, six to ten
sentences on photosynthesis, with the errors already planted and
tracked server-side, never sent to the browser."

**Action:** Tap the obvious planted lie, add a one-line reason, submit.
Show the results screen — score, the lie revealed, the correction
stated plainly.

---

## 0:40–1:15 — What makes this different: teacher mode

**On screen:** Back to landing page. This is the newest, most
demo-worthy part — give it real time.

**Voiceover:**

"Here's the part built for actual classrooms, not just trivia. A
teacher can upload their own material — a PDF, a text file, or just
pasted notes — and pick a lesson length: Quick, Standard, or Deep dive."

**Action:** Upload a short .txt or .pdf with an invented, specific
detail (a classroom pet's name, a made-up date — something that can't
exist in GPT-5.6's general knowledge). Submit and let the lesson
generate.

**Voiceover (continued):**

"Watch: this lesson isn't about a generic topic — it's built entirely
from that file. GPT-5.6 is constrained to only use what's in the
uploaded material for both the true sentences and the planted error.
That's the difference between a trivia toy and something a teacher can
assign against this week's actual reading."

---

## 1:15–1:45 — How GPT-5.6 is integrated, specifically

**On screen:** Split attention between the lesson result and, briefly,
the code — `lib/openai.ts` and `prompts/lesson-system-prompt.txt` if you
want a code cutaway here.

**Voiceover:**

"GPT-5.6 — specifically the Terra tier, called through the OpenAI
Responses API with Structured Outputs — does three jobs in this app,
all live API calls, none of them decorative. First, it writes the
lesson and self-verifies every non-planted sentence is actually true
before returning anything. Second, it calibrates error subtlety to a
five-tier taxonomy — a beginner gets an obviously wrong fact, an expert
gets a subtly reversed cause and effect. Third, on submission, it grades
not just *which* sentence I flagged, but whether my *stated reasoning*
was actually correct — partial credit for the right instinct, full
credit only for the right explanation."

---

## 1:45–2:10 — Safety, adaptation, and the guardrails

**On screen:** Quickly show a streak/tier indicator; optionally mention
without demoing the blocklist behavior.

**Voiceover:**

"Every planted error is revealed and corrected at the end — this app
never lets a lie stand uncorrected. Medical, legal, and safety-adjacent
topics skip lying entirely and switch to a straight comprehension quiz.
Difficulty adapts per learner from local history, and because this is a
public demo, GPT-5.6 calls are rate-limited per visitor and per day so
the whole thing stays live for everyone testing it."

---

## 2:10–2:45 — How Codex was used

**On screen:** Editor or terminal — show the Codex CLI session, or cut
to `app/api/lesson/route.ts`, `lib/rate-limit.ts`, `lib/file-extract.ts`.

**Voiceover:**

"Codex was the primary engineering agent for the entire build, driven
through the Codex CLI in one continuous session. It scaffolded the
Next.js app, wired both OpenAI Responses API routes to the Structured
Output schemas, and built the encrypted session handling that keeps
planted errors off the client. It made real engineering calls on its
own: choosing the GPT-5.6 Terra tier over the flagship model for cost
versus quality, designing the Vercel KV sliding-window rate limiter
before this went live publicly, and writing the Vitest coverage for
every piece of scoring and validation logic. I reviewed and verified
every change against a real, funded API key before it shipped."

---

## 2:45–3:00 — Close

**On screen:** Back to a clean results screen or the landing page.

**Voiceover:**

"Liesson turns reading into active error-detection — you can't catch a
lie without reasoning about the truth. GPT-5.6 is what makes lying
*pedagogically useful* possible at all; Codex is what built the product
around it. Try it yourself — the link's below."

---

## Notes before recording

- Have a funded OpenAI key and confirm one live generation works before
  hitting record — don't discover a quota error on camera.
- The teacher-material demo is the section most likely to impress
  judges on "idea quality" — don't rush it for time; cut from the
  0:00–0:15 hook instead if you're running long.
- State the actual GPT-5.6 mechanics out loud (Structured Outputs,
  Terra tier, the three-job breakdown) — the FAQ explicitly says vague
  "we used AI" claims score worse than specifics.
