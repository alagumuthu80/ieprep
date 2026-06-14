# IEPrep — *Plant the standard. Grow every learner.*

## 💡 Inspiration

Walk into a single special-education classroom and you'll find one teacher facing an impossible kind of math. There might be 8th graders reading at a 3rd-grade level sitting next to ones reading at a 6th-grade level, spread across five or more disability categories — **SLD, OHI/ADHD, ASD, EBD, ID** — and every one of them is entitled to the *same* grade-level standard, taught in a way they can actually access.

The teacher has to deliver one lesson that somehow becomes many. If a class of $n$ students spans $d$ distinct disability profiles and each student carries an IEP with its own goals and accommodations, the planning surface a teacher must cover scales like

$$
\text{Planning load} \;\propto\; \sum_{i=1}^{n} \big( \text{SOLs}_i \times \text{accommodations}_i \times \text{goals}_i \big),
$$

and then — after all of that — they still have to rebuild the whole thing *again* as Smart Board slides for the actual class period.

We watched real lesson decks from a working special-ed teacher (Unit 4 ELA, "Punctuate Dialogue") and saw the truth: the intellectual work of *differentiation* and the manual work of *making slides* were eating the nights and weekends that should belong to students. **That gap — between a standard and a classroom-ready, differentiated lesson — is what IEPrep was built to close.**

## 🌱 What it does

IEPrep turns **one standard into a full week of differentiated, ready-to-teach instruction.**

- **Build a class once.** Add students with their disability category, reading level, and accommodations. The roster is saved and reusable.
- **Generate a differentiated unit.** Pick up to **4 Virginia SOLs** and the disability categories present (up to 10). Claude *spirals* the standards across daily sessions instead of teaching one standard in isolation per week.
- **Make a day's slides.** Any single day becomes a classroom-ready Smart Board deck — a "Would You Rather?" hook, "I Can…" targets, a WICOR agenda, interactive A/B/C/D quizzes, and an exit ticket — rendered in **5 switchable visual themes** (Clean Classroom, Bold & Bright, Chalkboard, Notebook Paper, Garden Grove).
- **Track IEP goals.** Log trial-by-trial data, watch progress levels, and get AI instructional recommendations grounded in each student's trend.

## 📊 The IEP progress model

Goals are scored on a four-point trial scale. We map each logged trial $t_k \in \{1,2,3,4\}$ (the familiar $\tfrac{1}{4}\ldots\tfrac{4}{4}$) and derive a progress level from the most recent trials. Mastery isn't a single good day — it requires sustained performance:

$$
\text{Mastered} \iff \sum_{k=m-2}^{m} \mathbb{1}\!\left[t_k = 4\right] = 3,
$$

i.e. three consecutive $\tfrac{4}{4}$ trials. Short of that, the level falls back through **Approaching → Developing → Emerging** based on the latest score. The AI analyst also reads the **trend** between the two most recent trials,

$$
\Delta = t_m - t_{m-1},
$$

flagging goals as *improving* ($\Delta > 0$), *stable* ($\Delta = 0$), or *declining* ($\Delta < 0$) before recommending what to teach next.

## 🛠️ How we built it

**Stack.** Next.js 16 (App Router) + TypeScript + Tailwind, deployed on Railway with continuous deploys from GitHub.

**AI.** Three purpose-built engines, all on **Claude Opus 4.8** with **adaptive thinking** — not a chatbot bolted on, but Claude given the *full teaching context* each time:

1. **Lesson designer** — receives the SOLs, every disability category, accommodations, and student notes, then streams a day-by-day unit with tiered activities. Streaming (`ReadableStream` + the SDK's message stream) keeps long generations from hitting request timeouts.
2. **Slide author** — re-reads a *single day* and re-imagines it as a deck, choosing the right slide type and writing student-facing language pitched 1–2 grades below level. Returns structured JSON we render natively.
3. **Progress analyst** — turns raw trial data into specific instructional moves and a parent-communication note.

**Design.** A hand-built "Garden Grove" identity — a paper-cut SVG garden header (hills, fence, flowers, sun) and a warm beige/green/pink palette — so a tool for hard work still feels gentle.

A representative call:

```ts
const stream = await anthropic.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 8000,
  thinking: { type: "adaptive" },
  stream: true,
  messages: [{ role: "user", content: prompt }],
});
```

## 🧗 Challenges we faced

- **From "one big plan" to "one deck per day."** Our first version crammed an entire multi-week unit into a single slide deck. The fix was structural: prompt Claude to emit a strict, *parseable* `### Day N (Week W) — title` format, then split the streamed Markdown into day sessions so a teacher can build slides for exactly the class period they're teaching.
- **Wiring the class to the generator.** "Load for Lesson" silently did nothing — because the Lesson Generator wasn't even mounted while the user was on the Classes tab. We lifted the loaded-class state up to the app level and kept the panels mounted so the data survives the tab switch.
- **Hydration mismatches.** SVG sun-ray coordinates computed with $\cos$/$\sin$ produced floating-point values that differed by one ulp between server and client, triggering React hydration errors. Rounding to a fixed precision,
$$
x' = \frac{\operatorname{round}(1000\,x)}{1000},
$$
made server and client render byte-identical.
- **Click-through bugs.** The live theme picker opened but wouldn't accept clicks — the slide-content layer shared its `z-index` and swallowed the events. A z-index bump fixed it.
- **Deployment reality.** Railway defaulted to Node 18; Next.js 16 needs $\geq 20.9$. A one-line `engines` field and the build went green.

## 🎓 What we learned

- **The last mile is the product.** Plenty of tools generate a lesson *plan*. The hard, valuable part is everything *after* the plan — differentiation per learner and the slides a teacher actually presents. Following the teacher all the way to the Smart Board is what makes IEPrep useful.
- **Context beats cleverness.** The quality jump came not from prompt tricks but from *giving Claude everything* — standards, disabilities, accommodations, and live IEP data — and letting adaptive thinking do the reasoning.
- **Structure your AI output if you're going to parse it.** Treating the model's Markdown as a contract (`### Day N`) turned a free-form blob into a navigable, day-by-day product.
- **Design is accessibility.** For an overworked, stressed user, a warm and calm interface isn't decoration — it's part of whether the tool gets used at all.

## 🚀 What's next

Persistent cloud accounts, email reminders as IEP target dates approach, authentic state-by-state standards, one-click progress reports for IEP meetings, embedded timers/videos in slides, and shared classes for co-teaching teams.

> **Special education is where differentiation matters most — and where teachers have the least time to do it. IEPrep gives that time back.**
