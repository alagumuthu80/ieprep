"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Palette } from "lucide-react";

export type SlideType =
  | "title" | "hook" | "target" | "agenda"
  | "direct" | "video" | "practice" | "quiz"
  | "activity" | "review" | "exit"
  | "objective" | "materials" | "instruction" | "check" | "closure";

export type Slide = {
  id: number;
  type: SlideType;
  title: string;
  emoji: string;
  points: string[];
  speakerNote: string;
};

const TYPE_LABELS: Record<SlideType, string> = {
  title: "Welcome", hook: "Hook", target: "I Can...", agenda: "Agenda",
  direct: "Let's Learn", video: "Watch", practice: "Let's Practice", quiz: "Quiz Time",
  activity: "Activity", review: "Review", exit: "Exit Ticket",
  objective: "Objectives", materials: "Materials", instruction: "Instruction",
  check: "Check In", closure: "Wrap Up",
};

// ── Deck themes ────────────────────────────────────────────────────────────
// Each theme defines how a slide of a given type is painted.
type SlideStyle = {
  bg: string;            // slide background (css)
  text: string;          // main text color
  subtext: string;       // secondary text color
  badgeBg: string;       // type badge + number chips
  badgeText: string;
  cardBg: string;        // option cards / panels
  cardBorder: string;
  font: string;          // font stack
  titleFont?: string;    // optional separate title font
  decoration?: "none" | "chalk-border" | "notebook-lines" | "dots";
};

type DeckTheme = {
  id: string;
  name: string;
  emoji: string;
  style: (type: SlideType) => SlideStyle;
};

const ACCENTS: Record<SlideType, { main: string; soft: string }> = {
  title:       { main: "#2E7D52", soft: "#DCF2E6" },
  hook:        { main: "#E8920A", soft: "#FDF0D8" },
  target:      { main: "#2563EB", soft: "#DEE9FD" },
  agenda:      { main: "#0E8A80", soft: "#D7F2F0" },
  direct:      { main: "#5B49C7", soft: "#E7E3F9" },
  video:       { main: "#475569", soft: "#E5E9EF" },
  practice:    { main: "#D9670D", soft: "#FCE9D8" },
  quiz:        { main: "#D63867", soft: "#FBDFE8" },
  activity:    { main: "#8B3FC9", soft: "#F0E2FA" },
  review:      { main: "#0E7490", soft: "#D8EEF4" },
  exit:        { main: "#3D8B37", soft: "#E0F2DE" },
  objective:   { main: "#2563EB", soft: "#DEE9FD" },
  materials:   { main: "#8B3FC9", soft: "#F0E2FA" },
  instruction: { main: "#0E8A80", soft: "#D7F2F0" },
  check:       { main: "#D63867", soft: "#FBDFE8" },
  closure:     { main: "#2E7D52", soft: "#DCF2E6" },
};

const BOLD_BG: Record<SlideType, string> = {
  title: "#047857", hook: "#F59E0B", target: "#1D4ED8", agenda: "#0F766E",
  direct: "#4338CA", video: "#1E293B", practice: "#EA580C", quiz: "#BE123C",
  activity: "#6D28D9", review: "#0E7490", exit: "#15803D",
  objective: "#2563EB", materials: "#7C3AED", instruction: "#0D9488",
  check: "#E11D48", closure: "#059669",
};

const DECK_THEMES: DeckTheme[] = [
  {
    id: "classroom",
    name: "Clean Classroom",
    emoji: "🏫",
    style: (type) => ({
      bg: "#FFFFFF",
      text: "#1E2936",
      subtext: "#5B6B7C",
      badgeBg: ACCENTS[type].main,
      badgeText: "#FFFFFF",
      cardBg: ACCENTS[type].soft,
      cardBorder: ACCENTS[type].main,
      font: "'Trebuchet MS', 'Segoe UI', sans-serif",
      decoration: "dots",
    }),
  },
  {
    id: "bold",
    name: "Bold & Bright",
    emoji: "🎨",
    style: (type) => ({
      bg: BOLD_BG[type],
      text: "#FFFFFF",
      subtext: "rgba(255,255,255,0.75)",
      badgeBg: "rgba(255,255,255,0.25)",
      badgeText: "#FFFFFF",
      cardBg: "rgba(255,255,255,0.18)",
      cardBorder: "rgba(255,255,255,0.4)",
      font: "'Segoe UI', Arial, sans-serif",
    }),
  },
  {
    id: "chalkboard",
    name: "Chalkboard",
    emoji: "🧑‍🏫",
    style: (type) => ({
      bg: "#2A3B33",
      text: "#F5F1E3",
      subtext: "rgba(245,241,227,0.65)",
      badgeBg: type === "quiz" || type === "check" ? "#F4C95D" : "#9CC5A1",
      badgeText: "#22302A",
      cardBg: "rgba(245,241,227,0.08)",
      cardBorder: "rgba(245,241,227,0.35)",
      font: "'Comic Sans MS', 'Chalkboard SE', cursive",
      decoration: "chalk-border",
    }),
  },
  {
    id: "notebook",
    name: "Notebook Paper",
    emoji: "📓",
    style: (type) => ({
      bg: "#FDFBF0",
      text: "#27364B",
      subtext: "#6A7B92",
      badgeBg: type === "quiz" || type === "check" ? "#D6453D" : "#2E5EAA",
      badgeText: "#FFFFFF",
      cardBg: "#FFFFFF",
      cardBorder: "#C9D4E4",
      font: "'Comic Sans MS', 'Segoe Print', cursive",
      decoration: "notebook-lines",
    }),
  },
  {
    id: "garden",
    name: "Garden Grove",
    emoji: "🌻",
    style: (type) => ({
      bg: "#FDF6EC",
      text: "#3D2E1C",
      subtext: "#7A5C3A",
      badgeBg: type === "quiz" || type === "check" ? "#D4748A" : "#4A7A2E",
      badgeText: "#FFFFFF",
      cardBg: "#FFFDF7",
      cardBorder: "#D9C9A8",
      font: "'Trebuchet MS', 'Segoe UI', sans-serif",
      decoration: "dots",
    }),
  },
];

const THEME_STORAGE_KEY = "ieprep_deck_theme";

interface Props {
  slides: Slide[];
  onClose: () => void;
}

export default function SlideViewer({ slides, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [themeId, setThemeId] = useState("classroom");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && DECK_THEMES.some((t) => t.id === saved)) setThemeId(saved);
  }, []);

  function pickTheme(id: string) {
    setThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setShowThemePicker(false);
  }

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(slides.length - 1, c + 1)), [slides.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
      if (e.key === "Escape") { if (fullscreen) setFullscreen(false); else onClose(); }
      if (e.key === "f" || e.key === "F") setFullscreen((f) => !f);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, fullscreen, onClose]);

  const deck = DECK_THEMES.find((t) => t.id === themeId) ?? DECK_THEMES[0];
  const slide = slides[current];
  const s = deck.style(slide.type);
  const isLight = s.bg.startsWith("#F") || s.bg === "#FFFFFF";
  const chrome = isLight ? "#5B6B7C" : "rgba(255,255,255,0.7)";

  return (
    <div
      className={fullscreen ? "fixed inset-0 z-50 flex flex-col" : "fixed inset-0 z-50 flex flex-col bg-black/60 p-4 md:p-10"}
      onClick={fullscreen ? undefined : (e) => e.target === e.currentTarget && onClose()}
    >
      <div className={fullscreen ? "flex-1 flex flex-col" : "flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto w-full"}>

        <div className="flex-1 flex flex-col relative select-none overflow-hidden" style={{ background: s.bg, fontFamily: s.font }}>

          {/* Decorations */}
          {s.decoration === "notebook-lines" && (
            <div aria-hidden style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #DCE6F2 31px, #DCE6F2 32px)",
              opacity: 0.7,
            }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "56px", width: "2px", background: "#F2B8B8" }} />
            </div>
          )}
          {s.decoration === "chalk-border" && (
            <div aria-hidden style={{
              position: "absolute", inset: "10px", pointerEvents: "none",
              border: "3px dashed rgba(245,241,227,0.25)", borderRadius: "12px",
            }} />
          )}
          {s.decoration === "dots" && (
            <div aria-hidden style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `radial-gradient(${s.cardBorder}55 1.5px, transparent 1.5px)`,
              backgroundSize: "28px 28px", opacity: 0.4,
            }} />
          )}

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 relative" style={{ zIndex: 40 }}>
            <span style={{
              fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "4px 12px", borderRadius: "99px",
              background: s.badgeBg, color: s.badgeText,
            }}>
              {TYPE_LABELS[slide.type] ?? "Slide"}
            </span>
            <div className="flex items-center gap-3" style={{ color: chrome }}>
              <span className="text-sm">{current + 1} / {slides.length}</span>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowThemePicker((v) => !v)} title="Change theme"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ border: `1px solid ${chrome}`, color: chrome }}>
                  <Palette className="w-3.5 h-3.5" /> {deck.emoji}
                </button>
                {showThemePicker && (
                  <div style={{
                    position: "absolute", right: 0, top: "110%", zIndex: 50,
                    background: "#FFFFFF", borderRadius: "12px", border: "1px solid #D9D9D9",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)", padding: "6px", minWidth: "190px",
                  }}>
                    {DECK_THEMES.map((t) => (
                      <button key={t.id} onClick={() => pickTheme(t.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px", width: "100%",
                          padding: "8px 10px", borderRadius: "8px", border: "none", textAlign: "left",
                          background: t.id === themeId ? "#EDF5EC" : "transparent",
                          color: "#1E2936", fontWeight: t.id === themeId ? 700 : 500,
                          fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Segoe UI', sans-serif",
                        }}>
                        <span style={{ fontSize: "1rem" }}>{t.emoji}</span> {t.name}
                        {t.id === themeId && <span style={{ marginLeft: "auto", color: "#2E7D52" }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowNote((v) => !v)} className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ border: `1px solid ${chrome}`, color: chrome }}>
                Notes
              </button>
              <button onClick={() => setFullscreen((f) => !f)} style={{ color: chrome }}>
                {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button onClick={onClose} style={{ color: chrome }}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pb-8 text-center z-10">
            {slide.type === "quiz" ? (
              <QuizLayout slide={slide} s={s} />
            ) : slide.type === "hook" ? (
              <HookLayout slide={slide} s={s} />
            ) : slide.type === "agenda" ? (
              <AgendaLayout slide={slide} s={s} />
            ) : (
              <DefaultLayout slide={slide} s={s} />
            )}
          </div>

          {/* Speaker note */}
          {showNote && slide.speakerNote && (
            <div className="text-sm px-6 py-3 z-10" style={{
              background: isLight ? "#F2F4F7" : "rgba(0,0,0,0.3)",
              color: isLight ? "#3A4756" : "rgba(255,255,255,0.9)",
              borderTop: `1px solid ${s.cardBorder}`,
            }}>
              <span style={{ fontWeight: 700, opacity: 0.6, marginRight: "8px" }}>Teacher note:</span>
              {slide.speakerNote}
            </div>
          )}

          <button onClick={prev} disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all disabled:opacity-0 z-10"
            style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.25)", color: isLight ? "#3A4756" : "white" }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={next} disabled={current === slides.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all disabled:opacity-0 z-10"
            style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.25)", color: isLight ? "#3A4756" : "white" }}>
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="bg-slate-900 px-4 py-2 flex gap-2 overflow-x-auto">
          {slides.map((sl, i) => (
            <button key={sl.id} onClick={() => setCurrent(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                i === current ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"
              }`}>
              <span className="text-lg">{sl.emoji}</span>
              <span className="max-w-[72px] truncate">{sl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {!fullscreen && (
        <p className="text-center text-white/40 text-xs mt-3">← → arrow keys · F = fullscreen · Esc = close · 🎨 to change theme</p>
      )}
    </div>
  );
}

// ── Layouts ────────────────────────────────────────────────────────────────

function DefaultLayout({ slide, s }: { slide: Slide; s: SlideStyle }) {
  return (
    <>
      <div className="text-7xl md:text-8xl mb-4">{slide.emoji}</div>
      <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6" style={{ color: s.text }}>
        {slide.title}
      </h2>
      {slide.points.length > 0 && (
        <ul className="space-y-3 w-full max-w-2xl text-left">
          {slide.points.map((pt, i) => (
            <li key={i} className="flex items-start gap-3 text-xl md:text-2xl font-semibold" style={{ color: s.text }}>
              <span className="mt-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: s.badgeBg, color: s.badgeText }}>
                {i + 1}
              </span>
              {pt}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function HookLayout({ slide, s }: { slide: Slide; s: SlideStyle }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="text-6xl md:text-7xl mb-4">{slide.emoji}</div>
      <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ color: s.text }}>
        {slide.title}
      </h2>
      {slide.points.length >= 2 ? (
        <div className="grid grid-cols-2 gap-4">
          {slide.points.slice(0, 2).map((pt, i) => (
            <div key={i} className="rounded-2xl p-4 md:p-6 font-bold text-lg md:text-xl text-center"
              style={{ background: s.cardBg, color: s.text, border: `2px solid ${s.cardBorder}` }}>
              {i === 0 ? "🅰️" : "🅱️"} {pt}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xl md:text-2xl font-semibold" style={{ color: s.subtext }}>{slide.points[0]}</p>
      )}
    </div>
  );
}

function QuizLayout({ slide, s }: { slide: Slide; s: SlideStyle }) {
  const [selected, setSelected] = useState<number | null>(null);
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-3xl">
      <div className="text-5xl mb-3">{slide.emoji}</div>
      <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-6" style={{ color: s.text }}>
        {slide.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {slide.points.map((pt, i) => {
          const isCorrect = pt.includes("✓");
          const label = pt.replace(" ✓", "").replace("✓", "").trim();
          const isSelected = selected === i;
          return (
            <button key={i} onClick={() => setSelected(i)}
              className="flex items-center gap-3 rounded-xl p-4 text-left font-semibold text-lg transition-all"
              style={{
                background: isSelected ? (isCorrect ? "#C9EAC9" : "#F6CFCF") : s.cardBg,
                border: `2px solid ${isSelected ? (isCorrect ? "#3D8B37" : "#C44") : s.cardBorder}`,
                color: isSelected ? "#1E2936" : s.text,
              }}>
              <span className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: s.badgeBg, color: s.badgeText }}>
                {letters[i] ?? i + 1}
              </span>
              <span>{label}</span>
              {isSelected && isCorrect && <span className="ml-auto text-xl">✅</span>}
              {isSelected && !isCorrect && <span className="ml-auto text-xl">❌</span>}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className="mt-4 text-sm font-medium" style={{ color: s.subtext }}>
          {slide.points[selected]?.includes("✓") ? "✅ Correct! Great job!" : "❌ Not quite — try again!"}
        </p>
      )}
    </div>
  );
}

function AgendaLayout({ slide, s }: { slide: Slide; s: SlideStyle }) {
  const wicorLine = slide.points.find((p) => p.toUpperCase().startsWith("WICOR"));
  const agendaItems = slide.points.filter((p) => !p.toUpperCase().startsWith("WICOR"));

  return (
    <div className="w-full max-w-2xl text-left">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-5xl">{slide.emoji}</span>
        <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: s.text }}>{slide.title}</h2>
      </div>
      <ul className="space-y-2 mb-5">
        {agendaItems.map((item, i) => (
          <li key={i} className="flex items-center gap-3 font-semibold text-lg" style={{ color: s.text }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: s.badgeBg, color: s.badgeText }}>
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
      {wicorLine && (
        <div className="rounded-xl p-3" style={{ background: s.cardBg, border: `1px solid ${s.cardBorder}` }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: s.subtext }}>WICOR</p>
          <div className="flex flex-wrap gap-2">
            {wicorLine.replace(/^WICOR:\s*/i, "").split("|").map((part, i) => (
              <span key={i} className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: s.badgeBg, color: s.badgeText }}>
                {part.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
