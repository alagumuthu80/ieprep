const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");
const fa = require("react-icons/fa");

// ── Garden Grove palette ──────────────────────────────────────────────
const C = {
  beige:   "FDF6EC",
  beigeDk: "F1E4CC",
  paper:   "FFFDF7",
  green:   "4A7A2E",
  greenDk: "2E5A18",
  greenLt: "6FA84A",
  sage:    "88C080",
  pink:    "C85A72",
  pinkLt:  "D4748A",
  sun:     "F5B400",
  sunDk:   "E08A00",
  sky:     "B8D9F0",
  skyDk:   "8FC0E0",
  brown:   "5D3A1A",
  brownMid:"8A6A45",
  ink:     "3D2E1C",
};

const HEAD = "Georgia";
const BODY = "Calibri";

const ASSETS = path.join(__dirname, "assets");
const sun = path.join(ASSETS, "sun.png");
const flower = path.join(ASSETS, "flower.png");
const hero = path.join(ASSETS, "garden_hero.png");

const W = 13.333, H = 7.5;

async function iconPng(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

const shadow = () => ({ type: "outer", color: "5A3C14", blur: 9, offset: 4, angle: 90, opacity: 0.22 });

function build() {
  return (async () => {
    const ICON = {
      clock:   await iconPng(fa.FaRegClock, "#" + C.pink),
      heart:   await iconPng(fa.FaHeart, "#" + C.pink),
      users:   await iconPng(fa.FaUsers, "#" + C.green),
      slides:  await iconPng(fa.FaChalkboardTeacher, "#" + C.green),
      chart:   await iconPng(fa.FaChartLine, "#" + C.green),
      magic:   await iconPng(fa.FaMagic, "#" + C.green),
      bolt:    await iconPng(fa.FaBolt, "#" + C.sunDk),
      check:   await iconPng(fa.FaCheckCircle, "#" + C.green),
      wrench:  await iconPng(fa.FaWrench, "#" + C.sunDk),
      bug:     await iconPng(fa.FaBug, "#" + C.pink),
      brain:   await iconPng(fa.FaBrain, "#" + C.green),
      lock:    await iconPng(fa.FaLock, "#" + C.green),
      seed:    await iconPng(fa.FaSeedling, "#" + C.green),
      book:    await iconPng(fa.FaBook, "#" + C.green),
      grad:    await iconPng(fa.FaGraduationCap, "#" + C.green),
      code:    await iconPng(fa.FaCode, "#" + C.green),
      rocket:  await iconPng(fa.FaRocket, "#" + C.pink),
      globe:   await iconPng(fa.FaGlobeAmericas, "#" + C.green),
      sunIco:  await iconPng(fa.FaSun, "#" + C.sunDk),
    };

    const pres = new pptxgen();
    pres.defineLayout({ name: "GG", width: W, height: H });
    pres.layout = "GG";
    pres.author = "IEPrep Team";
    pres.title = "IEPrep — Plant the standard. Grow every learner.";

    // ── helpers ────────────────────────────────────────────────────────
    function bg(slide, color = C.beige) { slide.background = { color }; }

    // a soft paper card
    function card(slide, x, y, w, h, fill = C.paper, radius = 0.14) {
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x, y, w, h, rectRadius: radius,
        fill: { color: fill }, line: { color: C.beigeDk, width: 1 },
        shadow: shadow(),
      });
    }

    // standard content-slide header band
    function header(slide, kicker, title, num) {
      slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 1.55, fill: { color: C.green } });
      slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.55, w: W, h: 0.06, fill: { color: C.sun } });
      slide.addImage({ path: sun, x: 11.95, y: 0.16, w: 1.18, h: 1.18 });
      slide.addText(kicker.toUpperCase(), {
        x: 0.6, y: 0.26, w: 9, h: 0.4, fontFace: BODY, fontSize: 13, bold: true,
        color: C.sun, charSpacing: 3, margin: 0,
      });
      slide.addText(title, {
        x: 0.6, y: 0.6, w: 10.6, h: 0.85, fontFace: HEAD, fontSize: 31, bold: true,
        color: "FFFFFF", margin: 0, valign: "middle",
      });
      slide.addText(String(num).padStart(2, "0"), {
        x: 0.0, y: 6.95, w: 0.9, h: 0.45, fontFace: BODY, fontSize: 12, color: C.brownMid, align: "center",
      });
    }

    // icon in a soft circle
    function iconChip(slide, data, x, y, d = 0.66, chip = C.green + "") {
      slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: "FFFFFF" }, line: { color: C.beigeDk, width: 1 } });
      const pad = d * 0.22;
      slide.addImage({ data, x: x + pad, y: y + pad, w: d - pad * 2, h: d - pad * 2 });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 1 — Title
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s, C.beige);
      // hero band across the bottom
      const heroW = W, heroH = heroW * (1360 / 3840);
      s.addImage({ path: hero, x: 0, y: H - heroH, w: heroW, h: heroH });
      // top sky tint
      s.addText("IEPrep", {
        x: 0.9, y: 1.15, w: 11.5, h: 1.5, fontFace: HEAD, fontSize: 76, bold: true,
        color: C.green, margin: 0,
      });
      s.addText("Plant the standard.  Grow every learner.", {
        x: 0.95, y: 2.55, w: 11.5, h: 0.6, fontFace: HEAD, fontSize: 24, italic: true,
        color: C.pink, margin: 0,
      });
      s.addText("AI-built differentiated lesson planning for special education", {
        x: 0.95, y: 3.25, w: 11, h: 0.5, fontFace: BODY, fontSize: 16, color: C.brownMid, margin: 0,
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 2 — The Problem
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "The problem", "Teachers are drowning in planning", 1);

      // big stat callouts
      const stats = [
        { big: "40+", small: "hours in a\nstandard week", ic: ICON.clock },
        { big: "10+", small: "unique student\nneeds at once", ic: ICON.users },
        { big: "1 week", small: "of prep time lost\nto a single month", ic: ICON.bolt },
      ];
      const cw = 3.7, gap = 0.45, startX = (W - (cw * 3 + gap * 2)) / 2;
      stats.forEach((st, i) => {
        const x = startX + i * (cw + gap), y = 1.95;
        card(s, x, y, cw, 2.25);
        iconChip(s, st.ic, x + 0.3, y + 0.3, 0.7);
        s.addText(st.big, { x: x + 0.3, y: y + 0.92, w: cw - 0.6, h: 0.65, fontFace: HEAD, fontSize: 38, bold: true, color: C.green, margin: 0 });
        s.addText(st.small, { x: x + 0.32, y: y + 1.58, w: cw - 0.6, h: 0.55, fontFace: BODY, fontSize: 12.5, color: C.brownMid, margin: 0, lineSpacingMultiple: 0.95 });
      });

      card(s, startX, 4.45, cw * 3 + gap * 2, 2.35, C.green);
      s.addImage({ path: flower, x: startX + 0.35, y: 4.78, w: 1.0, h: 1.0 });
      s.addText(
        "Special education multiplies the load. Every student carries a unique set of challenges — disabilities, accommodations, reading levels, IEP goals — and each one deserves a thoughtful, individualized path to the same standard.",
        { x: startX + 1.7, y: 4.7, w: cw * 3 + gap * 2 - 2.2, h: 1.0, fontFace: BODY, fontSize: 15.5, color: "FFFFFF", margin: 0, valign: "middle", lineSpacingMultiple: 1.05 }
      );
      s.addText(
        "That preparation eats the nights and weekends that should belong to students.",
        { x: startX + 1.7, y: 5.78, w: cw * 3 + gap * 2 - 2.2, h: 0.7, fontFace: BODY, fontSize: 14, italic: true, color: C.sun, margin: 0, valign: "middle" }
      );
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 3 — The Solution / What it does
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "The solution", "IEPrep: one standard → a full week of lessons", 2);

      s.addText(
        "Manage student needs alongside the Department of Education's Standards of Learning (SOLs) — and turn planning that took a day into two minutes.",
        { x: 0.6, y: 1.78, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 15, color: C.brown, margin: 0 }
      );

      const feats = [
        { ic: ICON.users,  t: "Build student profiles", d: "Up to 10 students with disabilities and required accommodations." },
        { ic: ICON.magic,  t: "Generate lesson plans", d: "Pick subject, grade, class length and SOL timeframe — get a detailed plan." },
        { ic: ICON.slides, t: "Create Smart Board slides", d: "Turn any day's lesson into a classroom-ready deck." },
        { ic: ICON.chart,  t: "Track progress", d: "Log IEP trial data and load lessons for the whole class." },
      ];
      const cw = 5.9, ch = 1.7, gx = 0.5, gy = 0.4;
      const sx = (W - (cw * 2 + gx)) / 2, sy = 2.5;
      feats.forEach((f, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = sx + col * (cw + gx), y = sy + row * (ch + gy);
        card(s, x, y, cw, ch);
        iconChip(s, f.ic, x + 0.32, y + 0.34, 0.78);
        s.addText(f.t, { x: x + 1.35, y: y + 0.28, w: cw - 1.6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: C.green, margin: 0 });
        s.addText(f.d, { x: x + 1.35, y: y + 0.78, w: cw - 1.6, h: 0.8, fontFace: BODY, fontSize: 13.5, color: C.brownMid, margin: 0, lineSpacingMultiple: 1.0 });
      });

      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y: 6.55, w: cw * 2 + gx, h: 0.62, rectRadius: 0.31, fill: { color: C.pink } });
      s.addText("Saving teachers hundreds of hours a year.", {
        x: sx, y: 6.55, w: cw * 2 + gx, h: 0.62, fontFace: BODY, fontSize: 15, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0,
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 4 — How we built it (tech)
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "How we built it", "Claude Opus did the heavy lifting", 3);

      // Hero AI card
      card(s, 0.6, 2.0, 6.0, 4.5, C.green);
      iconChip(s, ICON.brain, 0.92, 2.38, 0.95);
      s.addText("Claude Opus 4.8", { x: 2.1, y: 2.4, w: 4.2, h: 0.55, fontFace: HEAD, fontSize: 24, bold: true, color: "FFFFFF", margin: 0, valign: "middle" });
      s.addText("with adaptive thinking", { x: 2.1, y: 2.92, w: 4.2, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: C.sun, margin: 0 });
      s.addText(
        [
          { text: "Handled most of the build and the corrections.", options: { bullet: { code: "2022" }, color: "FFFFFF", breakLine: true, paraSpaceAfter: 8 } },
          { text: "Three engines: lesson designer, slide author, progress analyst.", options: { bullet: { code: "2022" }, color: "FFFFFF", breakLine: true, paraSpaceAfter: 8 } },
          { text: "Streamed long generations so they never time out.", options: { bullet: { code: "2022" }, color: "FFFFFF" } },
        ],
        { x: 0.95, y: 3.6, w: 5.3, h: 2.7, fontFace: BODY, fontSize: 15, color: "FFFFFF", margin: 0, lineSpacingMultiple: 1.05 }
      );

      // Tech stack card
      card(s, 6.9, 2.0, 5.85, 4.5);
      s.addImage({ data: ICON.code, x: 7.2, y: 2.3, w: 0.55, h: 0.55 });
      s.addText("The stack", { x: 7.85, y: 2.3, w: 4.5, h: 0.55, fontFace: HEAD, fontSize: 20, bold: true, color: C.green, margin: 0, valign: "middle" });

      const stack = [
        ["Frontend", "Next.js · TypeScript · Tailwind"],
        ["Source", "GitHub"],
        ["Deployment", "Railway"],
        ["Design", "Gamma · Figma"],
      ];
      let yy = 3.1;
      stack.forEach(([k, v]) => {
        s.addShape(pres.shapes.OVAL, { x: 7.25, y: yy + 0.08, w: 0.16, h: 0.16, fill: { color: C.pink } });
        s.addText(k, { x: 7.55, y: yy - 0.05, w: 1.9, h: 0.4, fontFace: BODY, fontSize: 14, bold: true, color: C.green, margin: 0 });
        s.addText(v, { x: 9.35, y: yy - 0.05, w: 3.3, h: 0.4, fontFace: BODY, fontSize: 14, color: C.brownMid, margin: 0 });
        yy += 0.82;
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 5 — Challenges
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "Challenges we ran into", "As expected, glitches happened", 4);

      const items = [
        { t: "A month in one slide", d: "Our first build crammed an entire month of plans onto a single slide." },
        { t: "“Load class” did nothing", d: "A frustrating hour chasing a button that silently failed." },
        { t: "Tiny rounding bugs", d: "Floating-point mismatches broke the artwork's render." },
        { t: "A menu that wouldn't click", d: "A z-index collision swallowed every click." },
        { t: "Deploys that kept failing", d: "A Node version mismatch turned the build red." },
        { t: "Design lost in translation", d: "A great design first arrived oversimplified." },
      ];
      const cw = 3.95, ch = 1.55, gx = 0.32, gy = 0.32;
      const sx = (W - (cw * 3 + gx * 2)) / 2, sy = 2.0;
      items.forEach((it, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = sx + col * (cw + gx), y = sy + row * (ch + gy);
        card(s, x, y, cw, ch);
        s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.1, h: ch, fill: { color: C.pink } });
        s.addImage({ data: ICON.bug, x: x + 0.28, y: y + 0.26, w: 0.4, h: 0.4 });
        s.addText(it.t, { x: x + 0.82, y: y + 0.2, w: cw - 1.0, h: 0.5, fontFace: HEAD, fontSize: 15, bold: true, color: C.green, margin: 0, valign: "middle" });
        s.addText(it.d, { x: x + 0.3, y: y + 0.75, w: cw - 0.55, h: 0.7, fontFace: BODY, fontSize: 12, color: C.brownMid, margin: 0, lineSpacingMultiple: 0.98 });
      });
      s.addText("Each one was a small wall — and getting past them is what made it real.", {
        x: sx, y: 5.95, w: cw * 3 + gx * 2, h: 0.5, fontFace: BODY, fontSize: 14, italic: true, color: C.pink, align: "center", margin: 0,
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 6 — Impact / Proud of
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "What we're proud of", "From a day of work to two minutes", 5);

      // Left: the big contrast
      card(s, 0.6, 2.0, 5.6, 4.5, C.sky);
      s.addText("Before", { x: 0.95, y: 2.3, w: 4.9, h: 0.5, fontFace: HEAD, fontSize: 20, bold: true, color: C.brown, margin: 0 });
      s.addText("A full day", { x: 0.95, y: 2.75, w: 4.9, h: 0.9, fontFace: HEAD, fontSize: 44, bold: true, color: C.pink, margin: 0 });
      s.addText("of planning and tracking per lesson.", { x: 0.95, y: 3.65, w: 4.9, h: 0.5, fontFace: BODY, fontSize: 14, color: C.brown, margin: 0 });
      s.addShape(pres.shapes.LINE, { x: 0.95, y: 4.35, w: 4.6, h: 0, line: { color: "FFFFFF", width: 2 } });
      s.addText("With IEPrep", { x: 0.95, y: 4.5, w: 4.9, h: 0.5, fontFace: HEAD, fontSize: 20, bold: true, color: C.green, margin: 0 });
      s.addText("2 minutes", { x: 0.95, y: 4.95, w: 4.9, h: 0.9, fontFace: HEAD, fontSize: 44, bold: true, color: C.green, margin: 0 });
      s.addText("with slides ready to teach.", { x: 0.95, y: 5.85, w: 4.9, h: 0.5, fontFace: BODY, fontSize: 14, color: C.brown, margin: 0 });

      // Right: the heart quote
      card(s, 6.5, 2.0, 6.25, 4.5, C.green);
      s.addImage({ data: ICON.heart, x: 6.85, y: 2.35, w: 0.6, h: 0.6 });
      s.addText(
        "“As a special ed teacher, watching IEPrep being created was astonishing.”",
        { x: 6.85, y: 3.05, w: 5.5, h: 1.5, fontFace: HEAD, fontSize: 21, italic: true, bold: true, color: "FFFFFF", margin: 0, lineSpacingMultiple: 1.05 }
      );
      s.addText(
        "It alleviates the complex, time-consuming, often daunting task of planning for the learners who deserve the most effective, tailored path. Teachers can focus on students — and walk into class with not just plans, but slides to teach them.",
        { x: 6.85, y: 4.7, w: 5.5, h: 1.6, fontFace: BODY, fontSize: 14.5, color: "FFFFFF", margin: 0, lineSpacingMultiple: 1.08 }
      );
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 7 — What we learned
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "What we learned", "Working with AI is a world to explore", 6);

      const lessons = [
        { ic: ICON.brain, t: "AI can create, learn, and teach", d: "And different LLMs work in different ways — you learn as it learns." },
        { ic: ICON.magic, t: "Be precise about the output", d: "Describe the desired result in detail; reword the prompt until it's right." },
        { ic: ICON.bolt,  t: "Minutes, not hours", d: "AI collapses timely tasks — a genuine companion for anyone learning." },
        { ic: ICON.users, t: "The 30% human input matters", d: "It's detailed work, and it doesn't come without clear instruction." },
      ];
      const cw = 5.9, ch = 1.7, gx = 0.5, gy = 0.4;
      const sx = (W - (cw * 2 + gx)) / 2, sy = 2.2;
      lessons.forEach((f, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = sx + col * (cw + gx), y = sy + row * (ch + gy);
        card(s, x, y, cw, ch);
        iconChip(s, f.ic, x + 0.32, y + 0.34, 0.78);
        s.addText(f.t, { x: x + 1.35, y: y + 0.28, w: cw - 1.6, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true, color: C.green, margin: 0 });
        s.addText(f.d, { x: x + 1.35, y: y + 0.82, w: cw - 1.6, h: 0.75, fontFace: BODY, fontSize: 13.5, color: C.brownMid, margin: 0, lineSpacingMultiple: 1.0 });
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 8 — What's next
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s);
      header(s, "What's next", "Room to grow the garden", 7);

      const next = [
        { ic: ICON.lock,  t: "Security & logins", d: "Move from single-user to a secure multi-tenant model." },
        { ic: ICON.users, t: "Richer profiles", d: "Deeper student detail — down to the minutiae of each need." },
        { ic: ICON.globe, t: "More states' SOLs", d: "Tailor the standards engine to any state's requirements." },
        { ic: ICON.grad,  t: "Beyond special ed", d: "Configure IEPrep for general-education teachers too." },
      ];
      const cw = 5.9, ch = 1.7, gx = 0.5, gy = 0.4;
      const sx = (W - (cw * 2 + gx)) / 2, sy = 2.2;
      next.forEach((f, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = sx + col * (cw + gx), y = sy + row * (ch + gy);
        card(s, x, y, cw, ch);
        iconChip(s, f.ic, x + 0.32, y + 0.34, 0.78);
        s.addText(f.t, { x: x + 1.35, y: y + 0.28, w: cw - 1.6, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true, color: C.green, margin: 0 });
        s.addText(f.d, { x: x + 1.35, y: y + 0.82, w: cw - 1.6, h: 0.75, fontFace: BODY, fontSize: 13.5, color: C.brownMid, margin: 0, lineSpacingMultiple: 1.0 });
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // SLIDE 9 — Closing
    // ════════════════════════════════════════════════════════════════════
    {
      const s = pres.addSlide();
      bg(s, C.beige);
      const heroW = W, heroH = heroW * (1360 / 3840);
      s.addImage({ path: hero, x: 0, y: H - heroH, w: heroW, h: heroH });
      s.addText("IEPrep", { x: 0.9, y: 0.85, w: 10, h: 1.2, fontFace: HEAD, fontSize: 64, bold: true, color: C.green, margin: 0 });
      s.addText("Special education is where differentiation matters most —", {
        x: 0.95, y: 2.05, w: 11.5, h: 0.5, fontFace: HEAD, fontSize: 20, italic: true, color: C.pink, margin: 0,
      });
      s.addText("and where teachers have the least time to do it. IEPrep gives that time back.", {
        x: 0.95, y: 2.5, w: 11, h: 0.5, fontFace: HEAD, fontSize: 20, italic: true, color: C.brown, margin: 0,
      });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.95, y: 3.25, w: 2.5, h: 0.62, rectRadius: 0.31, fill: { color: C.green } });
      s.addText("Thank you.", {
        x: 0.95, y: 3.25, w: 2.5, h: 0.62, fontFace: BODY, fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0,
      });
    }

    await pres.writeFile({ fileName: path.join(__dirname, "IEPrep_Hackathon_Deck.pptx") });
    console.log("Deck written.");
  })();
}

build().catch(e => { console.error(e); process.exit(1); });
