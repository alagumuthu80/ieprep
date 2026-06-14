## Inspiration

Walk into a single special-education classroom and you'll find one teacher facing an impossible task. There might be 8th graders reading at a 3rd-grade level sitting next to ones reading at a 6th-grade level, spread across five or more disability categories — SLD, OHI/ADHD, ASD, EBD, ID — and every one of them is entitled to the *same* grade-level standard, taught in a way they can actually access.

We looked at real lesson decks from a working special-ed teacher and saw the truth: the intellectual work of *differentiating* a lesson and the manual work of *building the slides* to teach it were eating nights and weekends that should belong to students. That gap — between a standard and a classroom-ready, differentiated lesson — is what inspired IEPrep.

## What it does

IEPrep turns one standard into a full week of differentiated, ready-to-teach instruction.

- **Build a class once.** Add students with their disability category, reading level, and accommodations. The roster is saved and reusable.
- **Generate a differentiated unit.** Pick up to 4 Virginia SOLs and the disability categories present in the room. Claude *spirals* the standards across daily sessions instead of teaching one standard in isolation per week, with tiered activities so every learner can access the content.
- **Make a day's slides.** Any single day becomes a classroom-ready Smart Board deck — a "Would You Rather?" hook, "I Can…" learning targets, a WICOR agenda, interactive A/B/C/D quizzes, and an exit ticket — in 5 switchable visual themes.
- **Track IEP goals.** Log trial-by-trial data (1/4 → 4/4), watch progress levels, and get AI instructional recommendations grounded in each student's trend.

## How we built it

IEPrep is a Next.js 16 (App Router) app in TypeScript and Tailwind, deployed on Railway with continuous deploys from GitHub.

At its heart are three purpose-built AI engines, all running on Claude Opus 4.8 with adaptive thinking — not a chatbot bolted on, but Claude handed the *full teaching context* each time:

1. **Lesson designer** — receives the SOLs, every disability category, accommodations, and student notes, then streams a day-by-day differentiated unit.
2. **Slide author** — re-reads a single day and re-imagines it as a deck, choosing the right slide type and writing student-facing language pitched 1–2 grades below level.
3. **Progress analyst** — turns raw IEP trial data into specific instructional moves and a parent-communication note.

We used streaming responses so long lesson generations never hit request timeouts, and we wrapped it all in a hand-built "Garden Grove" design — a paper-cut SVG garden header and a warm beige/green/pink palette — so a tool for hard work still feels gentle.

## Challenges we ran into

- **From "one big plan" to "one deck per day."** Our first version crammed an entire multi-week unit into a single slide deck. The fix was structural: we prompt Claude to emit a strict, parseable day-by-day format, then split the output so a teacher can build slides for exactly the class period they're teaching.
- **Wiring the class to the generator.** "Load for Lesson" silently did nothing — because the lesson generator wasn't even mounted while the user was on the Classes tab. We lifted the loaded-class state up to the app level so it survives the tab switch.
- **React hydration mismatches.** SVG sun-ray coordinates computed with sine/cosine differed by a tiny floating-point amount between server and client, throwing hydration errors. Rounding to a fixed precision made both render identically.
- **A theme picker that wouldn't click.** The live theme menu opened but swallowed clicks because the slide layer shared its stacking order — a z-index fix solved it.
- **Deployment reality.** Railway defaulted to Node 18; Next.js 16 needs 20.9+. A one-line config change turned the build green.

## Accomplishments that we're proud of

- **We closed the last mile.** Most AI tools stop at a text plan. IEPrep follows the teacher all the way to the Smart Board — past the plan, into themed, interactive slides they can actually present.
- **An end-to-end working product**, not a prototype: build a class → generate a differentiated unit → produce per-day slide decks → track IEP goals, all live and deployed.
- **Genuine differentiation.** It accounts for multiple standards, up to 10 disability categories at once, individual accommodations, and live IEP goal data — the real complexity of an inclusion classroom.
- **A warm, calm interface** that respects how stressed and overworked the target user already is.

## What we learned

- **The last mile is the product.** Generating a lesson *plan* is easy; the hard, valuable work is everything after — differentiating per learner and producing the slides a teacher actually teaches from.
- **Context beats cleverness.** The biggest quality jumps came not from prompt tricks but from giving Claude everything — standards, disabilities, accommodations, live data — and letting adaptive thinking reason over it.
- **Structure your AI output if you're going to parse it.** Treating the model's response as a contract turned a free-form blob into a navigable, day-by-day product.
- **Design is accessibility.** For an overworked user, a calm interface isn't decoration — it's part of whether the tool gets used at all.

## What's next for IEPrep

- Persistent cloud accounts so classes, goals, and plans follow the teacher across devices.
- Email reminders as IEP goal target dates approach or progress stalls.
- Authentic state-by-state standards beyond Virginia, across more grade bands.
- One-click progress reports for parents and IEP meetings, generated from logged trial data.
- Richer slides — embedded timers, videos, and printable student handouts.
- Shared classes so general-ed and special-ed teachers can co-plan.
