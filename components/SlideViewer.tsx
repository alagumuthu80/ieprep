"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from "lucide-react";

export type Slide = {
  id: number;
  type: "title" | "objective" | "materials" | "instruction" | "activity" | "check" | "closure";
  title: string;
  emoji: string;
  points: string[];
  speakerNote: string;
};

const TYPE_THEMES: Record<Slide["type"], { bg: string; accent: string; badge: string }> = {
  title:       { bg: "bg-indigo-700",  accent: "text-indigo-100",  badge: "bg-indigo-500" },
  objective:   { bg: "bg-blue-600",    accent: "text-blue-100",    badge: "bg-blue-400" },
  materials:   { bg: "bg-violet-600",  accent: "text-violet-100",  badge: "bg-violet-400" },
  instruction: { bg: "bg-teal-600",    accent: "text-teal-100",    badge: "bg-teal-400" },
  activity:    { bg: "bg-amber-500",   accent: "text-amber-100",   badge: "bg-amber-300" },
  check:       { bg: "bg-rose-600",    accent: "text-rose-100",    badge: "bg-rose-400" },
  closure:     { bg: "bg-emerald-600", accent: "text-emerald-100", badge: "bg-emerald-400" },
};

const TYPE_LABELS: Record<Slide["type"], string> = {
  title: "Lesson",
  objective: "Objectives",
  materials: "Materials",
  instruction: "Let's Learn",
  activity: "Let's Try It",
  check: "Check In",
  closure: "Wrap Up",
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
  const theme = TYPE_THEMES[slide.type];

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col"
    : "fixed inset-0 z-50 flex flex-col bg-black/60 p-4 md:p-10";

  return (
    <div className={containerClass} onClick={fullscreen ? undefined : (e) => e.target === e.currentTarget && onClose()}>
      <div className={`${fullscreen ? "flex-1 flex flex-col" : "flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto w-full"}`}>

        {/* Slide */}
        <div className={`${theme.bg} flex-1 flex flex-col relative select-none`}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${theme.badge} text-white`}>
              {TYPE_LABELS[slide.type]}
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

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 pb-8 text-center">
            <div className="text-7xl md:text-8xl mb-6 drop-shadow-lg">{slide.emoji}</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-8 drop-shadow">
              {slide.title}
            </h2>
            {slide.points.length > 0 && (
              <ul className="space-y-3 w-full max-w-2xl text-left">
                {slide.points.map((pt, i) => (
                  <li key={i} className={`flex items-start gap-3 text-xl md:text-2xl font-semibold text-white`}>
                    <span className={`mt-1 w-7 h-7 rounded-full ${theme.badge} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {i + 1}
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Speaker note */}
          {showNote && slide.speakerNote && (
            <div className="bg-black/30 text-white/90 text-sm px-6 py-3 border-t border-white/20">
              <span className="font-semibold text-white/60 mr-2">Teacher note:</span>
              {slide.speakerNote}
            </div>
          )}

          {/* Nav arrows */}
          <button
            onClick={prev}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 disabled:opacity-0 text-white rounded-full p-2 transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 disabled:opacity-0 text-white rounded-full p-2 transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Slide strip */}
        <div className="bg-slate-900 px-4 py-2 flex gap-2 overflow-x-auto">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                i === current ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="max-w-[72px] truncate">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      {!fullscreen && (
        <p className="text-center text-white/40 text-xs mt-3">← → arrow keys to navigate · F for fullscreen · Esc to close</p>
      )}
    </div>
  );
}
