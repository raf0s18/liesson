## Inspiration

Most education apps teach the same way — show you something true and hope it sticks. There's actual research on why that's not the best approach though: people remember things better when they have to catch an error than when they just read the correct version the first time. It's called "erroneous examples" in the learning science literature. Quiz apps sort of touch on this with multiple choice, but the wrong answers always sit off to the side, clearly labeled as options, never really part of the content itself.

So I built a lesson where the wrong answer isn't off to the side. It's baked into the text. You have to read it like you don't trust it.

## What it does

Type a topic, or better, upload something real — a PDF of a reading, some class notes, whatever a teacher's actually using — and pick how long you want the lesson. The app writes a short passage that's almost entirely accurate, except for one to three planted errors sized to how good you've been at catching them before. You tap the sentences that feel off, explain why if you can, and get scored on whether you actually understood what was wrong, not just whether you happened to tap the right line. Every lie gets revealed and corrected before you leave the page.

## How I built it

GPT-5.6 does the actual thinking here, and I mean that literally — it writes the lesson, decides how subtle each error should be based on a five-tier scale I worked out (from "obviously wrong" up to "sounds completely correct unless you really know the material"), and later grades whether a learner's explanation actually held up, not just whether they clicked the right sentence. I went with the Terra tier instead of the flagship one mostly because this app makes two model calls per lesson, and I didn't want a demo that costs real money every time someone tries it, without giving up the subtlety the harder tiers need.

Codex did basically all of the engineering. I ran it through the CLI in one long session and let it build the Next.js app, wire up both API routes to strict JSON schemas, and handle the session data so the "which sentence is the lie" answer key stays encrypted server-side and never gets shipped to the browser. Later in that same session it added rate limiting through Vercel KV once the app was actually going to sit behind a public link, and then the teacher-upload feature — including the call to extract PDF and text content entirely in the browser, so uploaded files never touch my server at all, just the text that comes out of them.

## Challenges I ran into

**Making sure the "true" parts were actually true.** This is the part I worried about most. If the app is going to lie to you on purpose, everything that isn't a planted lie has to be solid, or you end up teaching real misinformation by accident. I added a step where the model has to go back and re-check every sentence it didn't flag as an error before it's allowed to return anything.

**Not letting a public demo drain my API key.** Once there was a real, funded key sitting behind an unauthenticated link, rate limiting stopped being optional. I built a per-visitor cap plus a shared daily budget using Vercel KV, and mid-build discovered Vercel had actually deprecated their old native KV product for a marketplace integration — so I had to figure out which environment variable names the new setup actually used before anything would connect.

**Proving the "only use what I gave you" claim was actually true.** It's one thing to tell the model to only use the uploaded material, and another thing to know it's actually doing that. I tested it by making up a completely fake classroom pet with details that don't exist anywhere else, uploading that, and checking whether the generated lesson stuck entirely to my fake pet instead of filling in gaps with something the model already knew. It did.

**Chasing down a model name that looked fine but wasn't.** Lesson generation kept failing early on with a vague error. Turned out to be two separate problems tangled together — an unfunded API key, and a model string that needed a specific suffix (gpt-5.6-terra) instead of the plain name I'd started with. I ended up stripping the app away entirely and calling the API directly just to figure out which one was actually breaking.

## What I learned

Structured Outputs mattered a lot more than I expected going in — the moment the "which sentences are lies" data could drift even slightly from what the app actually shows you, the whole thing stops being trustworthy. The bigger lesson was really about the upload feature though: letting people ground the lesson in their own material, instead of just a topic name, ended up being a smaller change to build than I assumed, and it's the difference between a fun toy and something a teacher would actually use.
