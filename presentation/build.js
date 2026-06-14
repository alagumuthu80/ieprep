const pptxgen = require("pptxgenjs");
const p = new pptxgen();

p.defineLayout({ name: "W", width: 13.33, height: 7.5 });
p.layout = "W";
p.author = "IEPrep";
p.title = "IEPrep — Pitch Deck";

// ── Palette (Garden Grove) ──────────────────────────────────────────────
const C = {
  forest:   "234A12",
  green:    "4A7A2E",
  greenDk:  "2E5A18",
  moss:     "8BB86E",
  pale:     "D6EBBB",
  beige:    "FDF6EC",
  cream:    "FFFDF7",
  brown:    "3D2E1C",
  brownMid: "7A5C3A",
  pink:     "C85C76",
  pinkLt:   "F5C4D1",
  sun:      "F5C842",
  sky:      "B8D9F0",
  skyDk:    "5B9BC9",
  border:   "D9C9A8",
  white:    "FFFFFF",
};
const HF = "Trebuchet MS"; // header font
const BF = "Calibri";       // body font

const W = 13.33, H = 7.5;

// ── Helpers ─────────────────────────────────────────────────────────────
function bg(slide, color) {
  slide.background = { color };
}

// Paper-cut card: offset shadow rect + main rounded rect
function card(slide, x, y, w, h, opts = {}) {
  const fill = opts.fill || C.cream;
  const line = opts.line || C.border;
  const shadow = opts.shadow || C.border;
  const r = opts.rectRadius ?? 0.12;
  slide.addShape(p.ShapeType.roundRect, {
    x: x + 0.07, y: y + 0.09, w, h, rectRadius: r,
    fill: { color: shadow }, line: { type: "none" },
  });
  slide.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: r,
    fill: { color: fill }, line: { color: line, width: 1.25 },
  });
}

// little sun with rays (decorative)
function sun(slide, cx, cy, r, color = C.sun, op = 100) {
  slide.addShape(p.ShapeType.ellipse, {
    x: cx - r, y: cy - r, w: r * 2, h: r * 2,
    fill: { color, transparency: 100 - op }, line: { type: "none" },
  });
  for (let a = 0; a < 360; a += 45) {
    const rad = (a * Math.PI) / 180;
    slide.addShape(p.ShapeType.line, {
      x: cx + Math.cos(rad) * r * 1.35, y: cy + Math.sin(rad) * r * 1.35,
      w: Math.cos(rad) * r * 0.5, h: Math.sin(rad) * r * 0.5,
      line: { color, width: 2, transparency: 100 - op },
    });
  }
}

// rolling hill band at the bottom of a slide
function hills(slide, base = H - 0.9) {
  slide.addShape(p.ShapeType.ellipse, { x: -2, y: base, w: 9, h: 3, fill: { color: C.moss, transparency: 55 }, line: { type: "none" } });
  slide.addShape(p.ShapeType.ellipse, { x: 5, y: base + 0.2, w: 11, h: 3, fill: { color: C.moss, transparency: 65 }, line: { type: "none" } });
  slide.addShape(p.ShapeType.rect, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: C.green }, line: { type: "none" } });
}

function tag(slide, x, y, text, fill = C.green, color = C.white) {
  slide.addText(text.toUpperCase(), {
    x, y, w: 3.4, h: 0.36, align: "left", valign: "middle",
    fontFace: HF, fontSize: 11, bold: true, color, charSpacing: 2,
    fill: { color: fill }, rectRadius: 0.18, shape: p.ShapeType.roundRect,
    margin: [2, 10, 2, 10],
  });
}

function kicker(slide, num, label) {
  slide.addText(`${num}`, {
    x: 0.6, y: 0.5, w: 0.7, h: 0.7, align: "center", valign: "middle",
    fontFace: HF, fontSize: 20, bold: true, color: C.white,
    fill: { color: C.green }, shape: p.ShapeType.ellipse,
  });
  slide.addText(label.toUpperCase(), {
    x: 1.45, y: 0.5, w: 9, h: 0.7, align: "left", valign: "middle",
    fontFace: HF, fontSize: 13, bold: true, color: C.brownMid, charSpacing: 3,
  });
}

// ════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ════════════════════════════════════════════════════════════════════════
let s = p.addSlide();
bg(s, C.forest);
// soft hills
s.addShape(p.ShapeType.ellipse, { x: -3, y: 5.6, w: 12, h: 4, fill: { color: C.green, transparency: 35 }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 4, y: 6.0, w: 13, h: 4, fill: { color: C.greenDk, transparency: 30 }, line: { type: "none" } });
sun(s, 11.4, 1.5, 0.7, C.sun, 95);
// flowers
[[1.2, 6.4, C.pink], [1.7, 6.55, C.pinkLt], [2.2, 6.45, C.sun]].forEach(([fx, fy, col]) => {
  s.addShape(p.ShapeType.line, { x: fx, y: fy, w: 0, h: 0.5, line: { color: C.moss, width: 2 } });
  s.addShape(p.ShapeType.ellipse, { x: fx - 0.12, y: fy - 0.22, w: 0.24, h: 0.24, fill: { color: col }, line: { type: "none" } });
});

s.addText("🌱", { x: 0.9, y: 1.4, w: 1.2, h: 1.2, fontSize: 54, align: "center" });
s.addText("IEPrep", {
  x: 0.85, y: 2.5, w: 8, h: 1.4, fontFace: HF, fontSize: 76, bold: true, color: C.white,
});
s.addText("Differentiated lesson planning & IEP tracking for special education teachers", {
  x: 0.9, y: 3.95, w: 9.4, h: 0.9, fontFace: BF, fontSize: 22, color: C.pale,
});
s.addText("Plan once. Differentiate for every learner. Walk into class with slides ready.", {
  x: 0.9, y: 4.85, w: 9.6, h: 0.6, fontFace: BF, fontSize: 15, italic: true, color: C.moss,
});
s.addText("Powered by Claude  ·  AI for Education Hackathon", {
  x: 0.9, y: 6.55, w: 8, h: 0.4, fontFace: HF, fontSize: 12, bold: true, color: C.sun, charSpacing: 1,
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.beige);
kicker(s, "01", "The Problem");
s.addText("Special-ed teachers spend nights rebuilding the same lesson for every learner", {
  x: 0.6, y: 1.35, w: 8.3, h: 1.5, fontFace: HF, fontSize: 30, bold: true, color: C.brown, lineSpacingMultiple: 0.95,
});

const probs = [
  ["📚", "One class, many levels", "A single 8th-grade room may hold readers at a 3rd-grade level and a 6th-grade level, across 5+ disability categories — all needing the same standard taught differently."],
  ["📝", "IEP paperwork never stops", "Goals, accommodations, and trial-by-trial progress data must be tracked for every student and woven into daily instruction."],
  ["⏰", "Hours lost to busywork", "Teachers hand-build lesson plans, then rebuild them again as Smart Board slides — time that should go to students."],
];
let py = 2.95;
probs.forEach(([emoji, head, body]) => {
  card(s, 0.6, py, 8.5, 1.18, { fill: C.cream });
  s.addText(emoji, { x: 0.8, y: py + 0.1, w: 0.9, h: 0.95, fontSize: 30, align: "center", valign: "middle" });
  s.addText(head, { x: 1.8, y: py + 0.12, w: 7.1, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: C.green });
  s.addText(body, { x: 1.8, y: py + 0.5, w: 7.15, h: 0.62, fontFace: BF, fontSize: 11.5, color: C.brownMid, lineSpacingMultiple: 0.95 });
  py += 1.32;
});

// stat panel on the right
card(s, 9.45, 1.5, 3.25, 5.4, { fill: C.green, line: C.greenDk, shadow: C.greenDk });
s.addText("THE COST", { x: 9.65, y: 1.75, w: 2.9, h: 0.4, fontFace: HF, fontSize: 12, bold: true, color: C.pale, charSpacing: 2 });
const stats = [["7+ hrs", "planning per week, much of it differentiation & slides"], ["5–7", "disability categories in one inclusion classroom"], ["1 plan", "expected to reach every learner, every day"]];
let sy = 2.35;
stats.forEach(([big, small]) => {
  s.addText(big, { x: 9.65, y: sy, w: 2.9, h: 0.7, fontFace: HF, fontSize: 38, bold: true, color: C.white });
  s.addText(small, { x: 9.65, y: sy + 0.72, w: 2.85, h: 0.7, fontFace: BF, fontSize: 12, color: C.pale, lineSpacingMultiple: 0.92 });
  sy += 1.55;
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 3 — THE SOLUTION (overview)
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.cream);
kicker(s, "02", "The Solution");
s.addText("IEPrep turns one standard into a full week of differentiated, ready-to-teach instruction", {
  x: 0.6, y: 1.3, w: 12, h: 1.0, fontFace: HF, fontSize: 26, bold: true, color: C.brown, lineSpacingMultiple: 0.95,
});

const feats = [
  ["📖", "Differentiated lesson plans", "Pick up to 4 Virginia SOLs and up to 10 disability categories. AI spirals the standards across daily sessions, tailored to each learner."],
  ["🖥️", "Smart Board slide decks", "Every day's plan becomes a classroom-ready deck: hooks, 'I Can' targets, WICOR agenda, interactive quizzes, exit tickets — in 5 visual themes."],
  ["🎯", "IEP goal tracking", "Log trial data (1/4 → 4/4), watch progress levels, and get AI instructional recommendations grounded in each student's trend."],
  ["🏫", "Built around classes", "Create a class, add students once, and generate a single cohesive lesson that differentiates for the whole room."],
];
const fx = [0.6, 6.95], fyR = [2.55, 4.75];
feats.forEach((f, i) => {
  const x = fx[i % 2], y = fyR[Math.floor(i / 2)];
  card(s, x, y, 5.78, 2.0, { fill: C.beige });
  s.addText(f[0], { x: x + 0.22, y: y + 0.22, w: 0.95, h: 0.95, fontSize: 34, align: "center", valign: "middle" });
  s.addText(f[1], { x: x + 1.25, y: y + 0.25, w: 4.4, h: 0.5, fontFace: HF, fontSize: 17, bold: true, color: C.green });
  s.addText(f[2], { x: x + 1.25, y: y + 0.78, w: 4.42, h: 1.1, fontFace: BF, fontSize: 12, color: C.brownMid, lineSpacingMultiple: 0.98 });
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 4 — HOW AI IS USED
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.forest);
s.addText("03  ·  HOW AI IS USED", { x: 0.6, y: 0.5, w: 8, h: 0.5, fontFace: HF, fontSize: 13, bold: true, color: C.sun, charSpacing: 3 });
s.addText("Claude is the lesson designer — not a chatbot bolted on", {
  x: 0.6, y: 1.05, w: 12, h: 0.9, fontFace: HF, fontSize: 28, bold: true, color: C.white,
});
s.addText("Three purpose-built AI engines, each given the full teaching context — standards, disabilities, accommodations, and live IEP data.", {
  x: 0.6, y: 1.95, w: 12, h: 0.6, fontFace: BF, fontSize: 14, color: C.pale,
});

const ai = [
  ["🧠", "Lesson designer", "Receives the SOLs, every disability category, accommodations, and student notes — then spirals standards into day-by-day sessions with tiered activities. Streamed live with adaptive reasoning."],
  ["🎬", "Slide author", "Re-reads a single day and re-imagines it as a classroom deck — choosing the right slide type (hook, quiz, exit ticket) and writing student-facing language 1–2 grades below level."],
  ["📈", "Progress analyst", "Reads each IEP goal's trial trend and returns specific instructional moves, focus areas, and a parent-communication note — turning raw data into next steps."],
];
let ax = 0.6;
ai.forEach(([emoji, head, body]) => {
  card(s, ax, 2.75, 3.9, 3.9, { fill: C.cream, line: C.green, shadow: C.greenDk });
  s.addText(emoji, { x: ax + 0.2, y: 2.95, w: 1.0, h: 0.95, fontSize: 38, align: "center", valign: "middle" });
  s.addText(head, { x: ax + 0.25, y: 3.95, w: 3.45, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: C.green });
  s.addText(body, { x: ax + 0.25, y: 4.5, w: 3.45, h: 2.0, fontFace: BF, fontSize: 12, color: C.brownMid, lineSpacingMultiple: 1.0 });
  ax += 4.13;
});
s.addText("Built on Claude Opus 4.8 with adaptive thinking · streaming responses · context-aware prompts", {
  x: 0.6, y: 6.85, w: 12, h: 0.4, fontFace: HF, fontSize: 11.5, bold: true, color: C.sun, align: "center", charSpacing: 1,
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 5 — WHY THIS IS DIFFERENT (innovation)
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.beige);
kicker(s, "04", "What makes it different");
s.addText("The 'last mile' of AI lesson planning", {
  x: 0.6, y: 1.35, w: 12, h: 0.7, fontFace: HF, fontSize: 28, bold: true, color: C.brown,
});
s.addText("Most AI tools stop at a text plan. IEPrep follows the teacher all the way to the Smart Board.", {
  x: 0.6, y: 2.1, w: 12, h: 0.5, fontFace: BF, fontSize: 14, color: C.brownMid,
});

// comparison: typical vs IEPrep
card(s, 0.6, 2.85, 5.85, 3.9, { fill: C.cream });
s.addText("Typical AI planner", { x: 0.85, y: 3.05, w: 5.3, h: 0.5, fontFace: HF, fontSize: 17, bold: true, color: C.brownMid });
[
  "One generic plan as a wall of text",
  "Ignores specific disabilities & IEP goals",
  "Teacher still builds slides by hand",
  "No record of student progress",
].forEach((t, i) => {
  s.addText("✕", { x: 0.9, y: 3.7 + i * 0.72, w: 0.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: C.pink });
  s.addText(t, { x: 1.35, y: 3.66 + i * 0.72, w: 4.9, h: 0.6, fontFace: BF, fontSize: 13, color: C.brown, valign: "middle" });
});

card(s, 6.85, 2.85, 5.85, 3.9, { fill: C.green, line: C.greenDk, shadow: C.greenDk });
s.addText("🌱  IEPrep", { x: 7.1, y: 3.05, w: 5.3, h: 0.5, fontFace: HF, fontSize: 17, bold: true, color: C.white });
[
  "Spirals multiple standards across a week",
  "Differentiates per disability & live IEP data",
  "Auto-builds themed Smart Board decks",
  "Tracks trials and recommends next steps",
].forEach((t, i) => {
  s.addText("✓", { x: 7.15, y: 3.7 + i * 0.72, w: 0.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: C.sun });
  s.addText(t, { x: 7.6, y: 3.66 + i * 0.72, w: 4.9, h: 0.6, fontFace: BF, fontSize: 13, color: C.white, valign: "middle" });
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 6 — LIVE DEMO
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.cream);
kicker(s, "05", "Live Demo");
s.addText("A five-step walkthrough", {
  x: 0.6, y: 1.35, w: 12, h: 0.7, fontFace: HF, fontSize: 28, bold: true, color: C.brown,
});
s.addText("From an empty screen to a class-ready slide deck in minutes.", {
  x: 0.6, y: 2.08, w: 12, h: 0.45, fontFace: BF, fontSize: 14, color: C.brownMid,
});

const steps = [
  ["1", "Build a class", "Create '8th Grade ELA', add students with their disability, reading level & accommodations."],
  ["2", "Load for a lesson", "One click pulls the whole roster into the generator — grade, standards focus, every accommodation."],
  ["3", "Pick SOLs & generate", "Choose up to 4 Virginia SOLs. Claude streams a differentiated unit broken into daily sessions."],
  ["4", "Make a day's slides", "Click any day → a themed Smart Board deck appears: hook, targets, quiz, exit ticket."],
  ["5", "Track the goals", "Log trial data on the Goal Tracker and get AI recommendations for what to teach next."],
];
let stx = 0.6;
const sw = (12.13 - 0.4 * 4) / 5;
steps.forEach(([n, head, body]) => {
  card(s, stx, 2.75, sw, 3.85, { fill: C.beige });
  s.addText(n, { x: stx + sw / 2 - 0.42, y: 3.0, w: 0.84, h: 0.84, align: "center", valign: "middle", fontFace: HF, fontSize: 26, bold: true, color: C.white, fill: { color: C.pink }, shape: p.ShapeType.ellipse });
  s.addText(head, { x: stx + 0.18, y: 4.0, w: sw - 0.36, h: 0.8, align: "center", fontFace: HF, fontSize: 15, bold: true, color: C.green });
  s.addText(body, { x: stx + 0.2, y: 4.8, w: sw - 0.4, h: 1.7, align: "center", fontFace: BF, fontSize: 11.5, color: C.brownMid, lineSpacingMultiple: 1.0 });
  stx += sw + 0.4;
});
s.addText("▶  Demo tip: open the deck, then use the 🎨 palette to switch between 5 classroom themes live.", {
  x: 0.6, y: 6.8, w: 12, h: 0.4, fontFace: HF, fontSize: 12, bold: true, color: C.skyDk, align: "center",
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 7 — IMPACT
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.beige);
kicker(s, "06", "Impact & Relevance");
s.addText("Who it helps", {
  x: 0.6, y: 1.35, w: 12, h: 0.7, fontFace: HF, fontSize: 28, bold: true, color: C.brown,
});

const who = [
  ["👩‍🏫", "Teachers", "Reclaims hours every week and removes the hardest part of the job — differentiating for everyone at once. Less burnout, more teaching."],
  ["🧑‍🎓", "Students", "Each learner meets the same grade-level standard through instruction pitched at their level, with their accommodations built in."],
  ["🏫", "Schools & districts", "More consistent IEP compliance, documented progress data, and a repeatable way to support inclusion classrooms at scale."],
];
let wx = 0.6;
who.forEach(([emoji, head, body]) => {
  card(s, wx, 2.4, 3.9, 3.0, { fill: C.cream });
  s.addText(emoji, { x: wx, y: 2.6, w: 3.9, h: 0.9, fontSize: 40, align: "center" });
  s.addText(head, { x: wx + 0.2, y: 3.55, w: 3.5, h: 0.5, align: "center", fontFace: HF, fontSize: 18, bold: true, color: C.green });
  s.addText(body, { x: wx + 0.25, y: 4.1, w: 3.4, h: 1.3, align: "center", fontFace: BF, fontSize: 12, color: C.brownMid, lineSpacingMultiple: 1.0 });
  wx += 4.13;
});
// banner
card(s, 0.6, 5.75, 12.13, 1.05, { fill: C.green, line: C.greenDk, shadow: C.greenDk });
s.addText("Special education is where differentiation matters most — and where teachers have the least time to do it. IEPrep gives that time back.", {
  x: 0.9, y: 5.85, w: 11.5, h: 0.85, align: "center", valign: "middle", fontFace: HF, fontSize: 15, bold: true, italic: true, color: C.white, lineSpacingMultiple: 0.95,
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 8 — NEXT STEPS
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.cream);
kicker(s, "07", "Next Steps");
s.addText("Where it could go", {
  x: 0.6, y: 1.35, w: 12, h: 0.7, fontFace: HF, fontSize: 28, bold: true, color: C.brown,
});

const next = [
  ["💾", "Persistent accounts", "Cloud sync of classes, goals & plans across devices (Supabase) so data follows the teacher."],
  ["🔔", "Smart reminders", "Email nudges when an IEP goal's target date approaches or progress stalls."],
  ["🗂️", "More standards", "Authentic Virginia SOL codes today; any state's standards and grade bands next."],
  ["📊", "Progress reports", "One-click parent & IEP-meeting summaries generated from logged trial data."],
  ["🎥", "Richer slides", "Embedded timers, videos and printable student handouts straight from a day's deck."],
  ["🌐", "Co-teaching", "Shared classes so general-ed and special-ed teachers plan together."],
];
const nx = [0.6, 4.73, 8.86], ny = [2.5, 4.65];
next.forEach((f, i) => {
  const x = nx[i % 3], y = ny[Math.floor(i / 3)];
  card(s, x, y, 3.85, 1.9, { fill: C.beige });
  s.addText(f[0], { x: x + 0.2, y: y + 0.22, w: 0.8, h: 0.8, fontSize: 26, align: "center", valign: "middle" });
  s.addText(f[1], { x: x + 1.05, y: y + 0.25, w: 2.7, h: 0.45, fontFace: HF, fontSize: 14.5, bold: true, color: C.green });
  s.addText(f[2], { x: x + 1.05, y: y + 0.72, w: 2.72, h: 1.05, fontFace: BF, fontSize: 11, color: C.brownMid, lineSpacingMultiple: 0.98 });
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 9 — WHY IT SCORES (rubric map)
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.forest);
s.addText("WHY IT SCORES", { x: 0.6, y: 0.5, w: 8, h: 0.5, fontFace: HF, fontSize: 13, bold: true, color: C.sun, charSpacing: 3 });
s.addText("Built for the rubric — and for real classrooms", {
  x: 0.6, y: 1.05, w: 12, h: 0.8, fontFace: HF, fontSize: 27, bold: true, color: C.white,
});

const rub = [
  ["Impact & Relevance", "25", "Gives overworked special-ed teachers hours back and reaches every learner at their level."],
  ["Innovation & Creativity", "25", "AI follows the teacher to the 'last mile' — past the plan, into themed Smart Board decks."],
  ["Functionality & Demo", "20", "End-to-end working app: classes → differentiated plan → per-day slides → goal tracking."],
  ["User Experience", "15", "One warm, intuitive 'Garden Grove' interface; load a class and present in a few clicks."],
  ["Presentation Quality", "15", "A clear story: problem → AI solution → live demo → impact, mirrored in this deck."],
];
let ry = 2.15;
rub.forEach(([name, pts, why]) => {
  card(s, 0.6, ry, 12.13, 0.88, { fill: C.cream });
  s.addText(pts, { x: 0.78, y: ry + 0.12, w: 1.0, h: 0.64, align: "center", valign: "middle", fontFace: HF, fontSize: 24, bold: true, color: C.white, fill: { color: C.green }, shape: p.ShapeType.roundRect, rectRadius: 0.1 });
  s.addText(name, { x: 2.0, y: ry + 0.1, w: 3.7, h: 0.68, valign: "middle", fontFace: HF, fontSize: 15, bold: true, color: C.green });
  s.addText(why, { x: 5.75, y: ry + 0.1, w: 6.8, h: 0.68, valign: "middle", fontFace: BF, fontSize: 12, color: C.brownMid, lineSpacingMultiple: 0.95 });
  ry += 0.98;
});

// ════════════════════════════════════════════════════════════════════════
// SLIDE 10 — CLOSING
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide();
bg(s, C.green);
s.addShape(p.ShapeType.ellipse, { x: -3, y: 5.4, w: 12, h: 4, fill: { color: C.greenDk, transparency: 25 }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 5, y: 5.9, w: 13, h: 4, fill: { color: C.forest, transparency: 30 }, line: { type: "none" } });
sun(s, 11.6, 1.45, 0.75, C.sun, 95);
[[1.0, 6.3, C.pinkLt], [1.5, 6.45, C.sun], [2.0, 6.35, C.cream]].forEach(([fx, fy, col]) => {
  s.addShape(p.ShapeType.line, { x: fx, y: fy, w: 0, h: 0.5, line: { color: C.pale, width: 2 } });
  s.addShape(p.ShapeType.ellipse, { x: fx - 0.12, y: fy - 0.22, w: 0.24, h: 0.24, fill: { color: col }, line: { type: "none" } });
});

s.addText("🌱", { x: 5.96, y: 1.5, w: 1.4, h: 1.4, fontSize: 60, align: "center" });
s.addText("Plant the standard. Grow every learner.", {
  x: 1.0, y: 3.0, w: 11.3, h: 1.0, align: "center", fontFace: HF, fontSize: 36, bold: true, color: C.white,
});
s.addText("IEPrep — differentiated lessons, slides & IEP tracking, powered by Claude.", {
  x: 1.0, y: 4.05, w: 11.3, h: 0.6, align: "center", fontFace: BF, fontSize: 17, color: C.pale,
});
s.addText("Thank you  ·  Live demo ready", {
  x: 1.0, y: 5.0, w: 11.3, h: 0.5, align: "center", fontFace: HF, fontSize: 14, bold: true, color: C.sun, charSpacing: 1,
});

// ── Save ────────────────────────────────────────────────────────────────
p.writeFile({ fileName: "presentation/IEPrep_Pitch_Deck.pptx" }).then((f) => console.log("Saved:", f));
