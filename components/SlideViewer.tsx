"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";

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

type Theme = { bg: string; accent: string; badge: string; label: string };

const THEMES: Record<SlideType, Theme> = {
  title:       { bg: "bg-emerald-700",  accent: "text-emerald-100",  badge: "bg-emerald-500",  label: "Welcome" },
  hook:        { bg: "bg-amber-500",    accent: "text-amber-50",     badge: "bg-amber-700",    label: "Hook" },
  target:      { bg: "bg-blue-700",     accent: "text-blue-100",     badge: "bg-blue-500",     label: "I Can..." },
  agenda:      { bg: "bg-teal-700",     accent: "text-teal-100",     badge: "bg-teal-500",     label: "Agenda" },
  direct:      { bg: "bg-indigo-700",   accent: "text-indigo-100",   badge: "bg-indigo-500",   label: "Let's Learn" },
  video:       { bg: "bg-slate-800",    accent: "text-slate-100",    badge: "bg-slate-500",    label: "Watch" },
  practice:    { bg: "bg-orange-600",   accent: "text-orange-50",    badge: "bg-orange-400",   label: "Let's Practice" },
  quiz:        { bg: "bg-rose-700",     accent: "text-rose-100",     badge: "bg-rose-500",     label: "Quiz Time" },
  activity:    { bg: "bg-violet-700",   accent: "text-violet-100",   badge: "bg-violet-500",   label: "Activity" },
  review:      { bg: "bg-cyan-700",     accent: "text-cyan-100",     badge: "bg-cyan-500",     label: "Review" },
  exit:        { bg: "bg-green-700",    accent: "text-green-100",    badge: "bg-green-500",    label: "Exit Ticket" },
  objective:   { bg: "bg-blue-600",     accent: "text-blue-100",     badge: "bg-blue-400",     label: "Objectives" },
  materials:   { bg: "bg-violet-600",   accent: "text-violet-100",   badge: "bg-violet-400",   label: "Materials" },
  instruction: { bg: "bg-teal-600",     accent: "text-teal-100",     badge: "bg-teal-400",     label: "Instruction" },
  check:       { bg: "bg-rose-600",     accent: "text-rose-100",     badge: "bg-rose-400",     label: "Check In" },
  closure:     { bg: "bg-emerald-600",  accent: "text-emerald-100",  badge: "bg-emerald-400",  label: "Wrap Up" },
};

interface Props {
  slides: Slide[];
  onClose: () => void;
}

export default function SlideViewer({ slides, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showNote, setShowNote] = useState(false);

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

  const slide = slides[current];
  const theme = THEMES[slide.type] ?? THEMES.direct;

  return (
    <div
      className={fullscreen ? "fixed inset-0 z-50 flex flex-col" : "fixed inset-0 z-50 flex flex-col bg-black/60 p-4 md:p-10"}
      onClick={fullscreen ? undefined : (e) => e.target === e.currentTarget && onClose()}
    >
      <div className={fullscreen ? "flex-1 flex flex-col" : "flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto w-full"}>

        <div className={`${theme.bg} flex-1 flex flex-col relative select-none overflow-hidden`}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 z-10">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${theme.badge} text-white`}>
              {theme.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm">{current + 1} / {slides.length}</span>
              <button onClick={() => setShowNote((s) => !s)} className="text-white/60 hover:text-white text-xs border border-white/30 px-2 py-1 rounded-lg transition-colors">
                Notes
              </button>
              <button onClick={() => setFullscreen((f) => !f)} className="text-white/70 hover:text-white transition-colors">
                {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pb-8 text-center">
            {slide.type === "quiz" ? (
              <QuizLayout slide={slide} theme={theme} />
            ) : slide.type === "hook" ? (
              <HookLayout slide={slide} />
            ) : slide.type === "agenda" ? (
              <AgendaLayout slide={slide} theme={theme} />
            ) : (
              <DefaultLayout slide={slide} theme={theme} />
            )}
          </div>

          {/* Speaker note */}
          {showNote && slide.speakerNote && (
            <div className="bg-black/30 text-white/90 text-sm px-6 py-3 border-t border-white/20">
              <span className="font-semibold text-white/60 mr-2">Teacher note:</span>
              {slide.speakerNote}
            </div>
          )}

          <button onClick={prev} disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 disabled:opacity-0 text-white rounded-full p-2 transition-all">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={next} disabled={current === slides.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 disabled:opacity-0 text-white rounded-full p-2 transition-all">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="bg-slate-900 px-4 py-2 flex gap-2 overflow-x-auto">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setCurrent(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                i === current ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"
              }`}>
              <span className="text-lg">{s.emoji}</span>
              <span className="max-w-[72px] truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {!fullscreen && (
        <p className="text-center text-white/40 text-xs mt-3">← → arrow keys · F = fullscreen · Esc = close</p>
      )}
    </div>
  );
}

function DefaultLayout({ slide, theme }: { slide: Slide; theme: Theme }) {
  return (
    <>
      <div className="text-7xl md:text-8xl mb-4 drop-shadow-lg">{slide.emoji}</div>
      <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6 drop-shadow">
        {slide.title}
      </h2>
      {slide.points.length > 0 && (
        <ul className="space-y-3 w-full max-w-2xl text-left">
          {slide.points.map((pt, i) => (
            <li key={i} className="flex items-start gap-3 text-xl md:text-2xl font-semibold text-white">
              <span className={`mt-1 w-7 h-7 rounded-full ${theme.badge} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
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

function HookLayout({ slide }: { slide: Slide }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="text-6xl md:text-7xl mb-4">{slide.emoji}</div>
      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-8 drop-shadow">
        {slide.title}
      </h2>
      {slide.points.length >= 2 ? (
        <div className="grid grid-cols-2 gap-4">
          {slide.points.slice(0, 2).map((pt, i) => (
            <div key={i} className="bg-white/20 rounded-2xl p-4 md:p-6 text-white font-bold text-lg md:text-xl text-center border-2 border-white/30">
              {i === 0 ? "🅰️" : "🅱️"} {pt}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/90 text-xl md:text-2xl font-semibold">{slide.points[0]}</p>
      )}
    </div>
  );
}

function QuizLayout({ slide, theme }: { slide: Slide; theme: Theme }) {
  const [selected, setSelected] = useState<number | null>(null);
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-3xl">
      <div className="text-5xl mb-3">{slide.emoji}</div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-6">
        {slide.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {slide.points.map((pt, i) => {
          const isCorrect = pt.includes("✓");
          const label = pt.replace(" ✓", "").replace("✓", "").trim();
          const isSelected = selected === i;
          return (
            <button key={i} onClick={() => setSelected(i)}
              className={`flex items-center gap-3 rounded-xl p-4 text-left font-semibold text-lg transition-all border-2 ${
                isSelected
                  ? isCorrect
                    ? "bg-green-400/40 border-green-300 text-white"
                    : "bg-red-400/40 border-red-300 text-white"
                  : "bg-white/15 border-white/30 text-white hover:bg-white/25"
              }`}>
              <span className={`w-9 h-9 rounded-full ${theme.badge} text-white flex items-center justify-center font-black text-sm flex-shrink-0`}>
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
        <p className="mt-4 text-white/80 text-sm font-medium">
          {slide.points[selected]?.includes("✓") ? "✅ Correct! Great job!" : "❌ Not quite — try again!"}
        </p>
      )}
    </div>
  );
}

function AgendaLayout({ slide, theme }: { slide: Slide; theme: Theme }) {
  const wicorLine = slide.points.find((p) => p.toUpperCase().startsWith("WICOR"));
  const agendaItems = slide.points.filter((p) => !p.toUpperCase().startsWith("WICOR"));

  return (
    <div className="w-full max-w-2xl text-left">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-5xl">{slide.emoji}</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">{slide.title}</h2>
      </div>
      <ul className="space-y-2 mb-5">
        {agendaItems.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-white font-semibold text-lg">
            <span className={`w-7 h-7 rounded-full ${theme.badge} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
      {wicorLine && (
        <div className="bg-white/20 rounded-xl p-3 border border-white/30">
          <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-2">WICOR</p>
          <div className="flex flex-wrap gap-2">
            {wicorLine.replace(/^WICOR:\s*/i, "").split("|").map((part, i) => (
              <span key={i} className={`text-xs font-bold px-2 py-1 rounded-lg ${theme.badge} text-white`}>
                {part.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
