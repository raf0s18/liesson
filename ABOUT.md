## Inspiration

Every education app I could think of teaches the same way: tell the learner something true, hope it sticks. Learning-science research on "erroneous examples" says the opposite approach works better — people encode a fact more deeply when they have to *catch* it being wrong than when they just read it correctly the first time. Quiz apps get halfway there with multiple-choice distractors, but the wrong answer is always cleanly separated from the real content. Nobody had made the lie itself *be* the lesson.

That gap felt like the actual idea: a micro-lesson that's almost entirely true, with one to three deliberate, calibrated errors hidden inside it, where the entire mechanic is reading adversarially. You can't spot a wrong fact without reasoning about the right one first.

## What it does

Liesson generates a short lesson on any topic — or, more usefully, on a teacher's own uploaded material (a PDF, a text file, or pasted notes) — and plants errors sized to the learner's current skill tier, from "obviously wrong" to "a subtly reversed cause and effect that sounds completely authoritative." You tap what you think is false, explain why, and get graded not just on *which* sentence you caught but on whether your *reasoning* was actually correct. Every lie is revealed and corrected at the end — it never leaves you holding a wrong belief.

## How I built it

GPT-5.6 (the Terra tier, chosen deliberately over the flagship for cost-versus-quality reasons — this app makes two model calls per lesson and needed to stay cheap at demo scale without sacrificing the subtlety of tier-4/5 errors) does three real jobs through the OpenAI Responses API with Structured Outputs: it writes the lesson and self-verifies every non-planted sentence before returning anything, it calibrates error subtlety against a five-tier taxonomy I designed from blatant-fact to plausible-misattribution, and on submission it independently judges whether a learner's stated reasoning was actually right, not just whether they tapped the correct sentence.

Codex was the primary engineering agent for the entire build, driven through the Codex CLI across one continuous session. It scaffolded the Next.js 15 App Router app, wired both API routes to strict JSON schemas, and built the session handling that keeps the ground-truth "which sentences are lies" data encrypted and server-side, never shipped to the browser where a curious learner could inspect it. Later rounds in the same session added Vercel KV-backed rate limiting before the app went live publicly, and the teacher-material grounding feature — including a decision to do PDF/text extraction entirely client-side, so uploaded files never touch the server at all, only the extracted text.

## Challenges I ran into

**Keeping the lying honest.** The hardest design problem wasn't technical, it was pedagogical: a lesson that's "mostly true" is only useful if the *true* parts are genuinely reliable. I added a mandatory self-verification pass to the generation prompt — the model has to independently re-confirm every non-planted sentence before returning JSON — after realizing an unverified true-sounding hallucination would be strictly worse than a labeled lie, since nothing would ever correct it.

**Protecting a public, unauthenticated demo.** Once the app had a real funded API key behind a link anyone could hit, rate limiting stopped being optional. I designed a sliding-window per-visitor cap plus a shared daily budget in Vercel KV — and along the way discovered Vercel had deprecated its native KV product in favor of a marketplace integration mid-build, which meant re-learning which env var names the new Upstash-backed integration actually produced before the code would even connect.

**Proving grounding actually worked.** For the teacher-material feature, "the model should only use the uploaded text" is easy to claim and easy to get subtly wrong. I verified it adversarially — uploading a passage about a completely invented classroom pet with details that exist nowhere in the real world — and confirmed the generated lesson's title, every sentence, and the planted error were all specific to that fictional content, not filled in from general knowledge.

**A model name that looked right but wasn't.** Early on, lesson generation failed with a generic error that turned out to be `insufficient_quota` on an unfunded key — but before I could tell that, I also had to rule out that the bare model string `"gpt-5.6"` (versus the correct `"gpt-5.6-terra"`) was the actual problem, which took a direct, isolated API call outside the app to diagnose cleanly.

## What I learned

Structured Outputs aren't a nice-to-have for an app like this, they're load-bearing — the moment "which sentences are lies" can drift even slightly from a strict schema, the whole trust model breaks. I also came away convinced that grounding generation in a user's own content, not just a free-text topic, is what actually separates a fun demo from something a teacher would put in front of a class — and that going from one to the other is a much smaller engineering lift than it sounds, as long as the constraint is stated explicitly and verified adversarially rather than assumed.
