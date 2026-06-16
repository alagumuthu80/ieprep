"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { VA_SOLS, DISABILITY_TYPES, ACCOMMODATIONS, DEMO_STUDENTS } from "@/lib/data";
import type { SchoolClass } from "@/lib/data";
import { Wand2, Download, Loader2, UserCheck, Presentation, X, Users } from "lucide-react";
import SlideViewer, { type Slide } from "@/components/SlideViewer";
import LessonHistory from "@/components/LessonHistory";
import AddStudentModal from "@/components/AddStudentModal";
import { saveLessonToHistory, type SavedLesson } from "@/lib/lessonHistory";
import React from "react";

type Subject = "Math" | "ELA";
type Grade = "6" | "7" | "8";

// ── Markdown → JSX renderer ────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 800, color: "var(--gg-brown)" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderLessonPlan(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let key = 0;

  function flushList() {
    if (!listItems.length) return;
    const items = listItems.map((item, i) => (
      <li key={i} style={{ marginBottom: "4px" }}>{renderInline(item)}</li>
    ));
    if (listType === "ol") {
      elements.push(<ol key={key++} style={{ paddingLeft: "20px", margin: "6px 0 10px", lineHeight: 1.65 }}>{items}</ol>);
    } else {
      elements.push(<ul key={key++} style={{ paddingLeft: "20px", margin: "6px 0 10px", lineHeight: 1.65 }}>{items}</ul>);
    }
    listItems = [];
    listType = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ") || line.startsWith("### ")) {
      flushList();
      const level = line.startsWith("### ") ? 3 : 2;
      const content = line.replace(/^#{2,3} /, "");
      elements.push(
        <h3 key={key++} style={{
          fontWeight: 800,
          color: level === 2 ? "var(--gg-green)" : "var(--gg-brown-mid)",
          fontSize: level === 2 ? "1.05rem" : "0.9rem",
          marginTop: level === 2 ? "22px" : "14px",
          marginBottom: "6px",
          borderBottom: level === 2 ? "2px solid var(--gg-green-pale)" : "none",
          paddingBottom: level === 2 ? "4px" : "0",
          letterSpacing: level === 2 ? "-0.2px" : "0",
        }}>
          {content}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={key++} style={{ fontWeight: 800, color: "var(--gg-brown)", fontSize: "1.15rem", marginTop: "24px", marginBottom: "8px" }}>
          {line.slice(2)}
        </h2>
      );
    } else if (/^[-*] /.test(line)) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listItems.push(line.slice(2));
    } else if (/^\d+\. /.test(line)) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listItems.push(line.replace(/^\d+\. /, ""));
    } else if (line.trim() === "") {
      flushList();
      elements.push(<div key={key++} style={{ height: "6px" }} />);
    } else {
      flushList();
      elements.push(
        <p key={key++} style={{ margin: "2px 0", lineHeight: 1.65 }}>{renderInline(line)}</p>
      );
    }
  }
  flushList();
  return elements;
}

// ── Parse a generated plan into day sessions ───────────────────────────────
type DaySession = { label: string; title: string; content: string };

function parseDaySessions(plan: string): DaySession[] {
  const lines = plan.split("\n");
  const sessions: DaySession[] = [];
  let currentHeading: string | null = null;
  let buffer: string[] = [];

  const dayRe = /^###\s+(Day\s+\d+[^\n]*)/i;
  const stopRe = /^##\s+(?!#)/; // a top-level ## section ends the daily block

  function flush() {
    if (currentHeading !== null) {
      const m = currentHeading.match(/Day\s+\d+(?:\s*\(Week\s*\d+\))?/i);
      const label = m ? m[0].replace(/\s+/g, " ") : currentHeading;
      const title = currentHeading.replace(/^Day\s+\d+(?:\s*\(Week\s*\d+\))?\s*[—\-:]?\s*/i, "").trim();
      sessions.push({ label, title, content: `### ${currentHeading}\n${buffer.join("\n")}`.trim() });
    }
    buffer = [];
  }

  for (const line of lines) {
    const dayMatch = line.match(dayRe);
    if (dayMatch) {
      flush();
      currentHeading = dayMatch[1].trim();
      continue;
    }
    if (currentHeading && stopRe.test(line)) {
      flush();
      currentHeading = null;
      continue;
    }
    if (currentHeading) buffer.push(line);
  }
  flush();
  return sessions;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LessonPlanGenerator({
  loadedClass: incomingClass,
  onClearClass,
}: {
  loadedClass?: SchoolClass | null;
  onClearClass?: () => void;
}) {
  const [subject, setSubject] = useState<Subject>("Math");
  const [grade, setGrade] = useState<Grade>("8");
  const [sols, setSols] = useState<string[]>([]);
  const [weeks, setWeeks] = useState("2");
  const [duration, setDuration] = useState("60");
  const [disabilityTypes, setDisabilityTypes] = useState<string[]>([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [studentNeeds, setStudentNeeds] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedStudent, setLoadedStudent] = useState<string | null>(null);
  const [loadedClass, setLoadedClass] = useState<SchoolClass | null>(null);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [slidesLoading, setSlidesLoading] = useState<string | null>(null); // holds the day label being built
  const [showSlides, setShowSlides] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [mode, setMode] = useState<"class" | "student">("class");
  const abortRef = useRef<AbortController | null>(null);

  const solsForGrade = VA_SOLS[subject][grade];

  // Day sessions parsed from the generated plan
  const sessions = useMemo(() => parseDaySessions(lessonPlan), [lessonPlan]);
  // Everything before the first "### Day" — used as unit context for each deck
  const unitContext = useMemo(() => {
    const idx = lessonPlan.search(/###\s+Day\s+\d+/i);
    return idx > 0 ? lessonPlan.slice(0, idx).trim() : "";
  }, [lessonPlan]);

  function addSol(id: string) {
    if (!id || sols.includes(id) || sols.length >= 4) return;
    setSols((prev) => [...prev, id]);
  }

  function removeSol(id: string) {
    setSols((prev) => prev.filter((s) => s !== id));
  }

  function toggleDisability(d: string) {
    setDisabilityTypes((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : prev.length < 10 ? [...prev, d] : prev
    );
  }

  function toggleAccommodation(acc: string) {
    setSelectedAccommodations((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  }

  function loadDemoStudent(studentId: string) {
    const student = DEMO_STUDENTS.find((s) => s.id === studentId);
    if (!student) return;
    setGrade(student.grade as Grade);
    setLoadedClass(null);
    if (!disabilityTypes.includes(student.disabilityType)) {
      setDisabilityTypes([student.disabilityType]);
    }
    setSelectedAccommodations(student.accommodations);
    setStudentNeeds(`Student ${studentId}: ${student.readingLevel} reading level. ${student.name}.`);
    setLoadedStudent(studentId);
  }

  // Apply a class loaded from the Classes tab (fires whenever the parent passes a new class object)
  useEffect(() => {
    if (!incomingClass) return;
    setLoadedClass(incomingClass);
    setLoadedStudent(null);
    setGrade(incomingClass.grade);
    setSubject(incomingClass.subject);
    setSols([]);
    setDisabilityTypes([...new Set(incomingClass.students.map((s) => s.disabilityType))]);
    setSelectedAccommodations([...new Set(incomingClass.students.flatMap((s) => s.accommodations))]);
    setStudentNeeds(
      `Class of ${incomingClass.students.length} students: ${incomingClass.students
        .map((s) => `${s.name} (${s.disabilityType}, reading at ${s.readingLevel})`)
        .join("; ")}`
    );
  }, [incomingClass]);

  async function generateLesson() {
    if (sols.length === 0) return;
    if (mode === "class" && !loadedClass) {
      alert("Please load a class first");
      return;
    }
    if (mode === "student" && !loadedStudent) {
      alert("Please select a student first");
      return;
    }

    setLessonPlan("");
    setLoading(true);
    abortRef.current = new AbortController();

    const studentGoals = loadedStudent
      ? DEMO_STUDENTS.find((s) => s.id === loadedStudent)?.goals.map((g) => ({
          area: g.area, goal: g.goal,
          progress: g.trials.length ? g.trials[g.trials.length - 1].score : "N/A",
          lastScore: g.trials.length ? g.trials[g.trials.length - 1].score : "N/A",
        }))
      : undefined;

    const studentInfo = loadedStudent
      ? DEMO_STUDENTS.find((s) => s.id === loadedStudent)
      : undefined;

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject, grade,
          sols: sols.map((s) => `${subject} ${grade}.${s}`),
          weeks, duration,
          disabilityTypes: mode === "student" && studentInfo
            ? [studentInfo.disabilityType]
            : (disabilityTypes.length ? disabilityTypes : ["General"]),
          accommodations: mode === "student" && studentInfo
            ? studentInfo.accommodations
            : selectedAccommodations,
          studentNeeds,
          studentGoals,
          classStudents: mode === "class" ? loadedClass?.students : undefined,
          generationMode: mode,
          studentId: mode === "student" ? loadedStudent : undefined,
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setLessonPlan((prev) => prev + decoder.decode(value));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setLessonPlan("Error generating lesson plan. Please check your API key and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function createSlides(session?: DaySession) {
    const dayLabel = session?.label ?? null;
    const content = session?.content ?? lessonPlan;
    setSlidesLoading(dayLabel ?? "single");
    try {
      const res = await fetch("/api/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonPlan: content,
          grade, subject, disabilityTypes,
          dayLabel,
          unitContext,
        }),
      });
      const data = await res.json();
      if (data.slides) {
        setSlides(data.slides);
        setShowSlides(true);
        // Save to lesson history
        const title = `${subject} Grade ${grade} — ${sols.length} SOL${sols.length !== 1 ? "s" : ""}`;
        saveLessonToHistory({
          title,
          subject,
          grade,
          sols,
          disabilityTypes,
          className: loadedClass?.name,
          lessonContent: lessonPlan,
          slides: data.slides,
        });
      } else alert("Slides could not be generated. Please try again.");
    } catch {
      alert("Error generating slides. Please try again.");
    } finally {
      setSlidesLoading(null);
    }
  }

  function onLoadLesson(lesson: SavedLesson) {
    setSubject(lesson.subject as Subject);
    setGrade(lesson.grade as Grade);
    setSols(lesson.sols);
    setDisabilityTypes(lesson.disabilityTypes);
    setLessonPlan(lesson.lessonContent);
    setSlides(lesson.slides);
    setShowSlides(true);
  }

  function handleAddStudentToClass(updatedClass: SchoolClass) {
    setLoadedClass(updatedClass);
    // Save to localStorage in ClassManager's context (would be handled by parent)
    const classesJson = localStorage.getItem("ieprep_classes");
    if (classesJson) {
      const classes = JSON.parse(classesJson);
      const idx = classes.findIndex((c: SchoolClass) => c.id === updatedClass.id);
      if (idx >= 0) {
        classes[idx] = updatedClass;
        localStorage.setItem("ieprep_classes", JSON.stringify(classes));
      }
    }
  }

  function downloadPDF() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>IEPrep Lesson Plan</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #3D2E1C; }
        h1 { color: #4A7A2E; border-bottom: 3px solid #4A7A2E; padding-bottom: 8px; }
        h2 { color: #4A7A2E; margin-top: 28px; border-bottom: 1px solid #D6EBBB; padding-bottom: 4px; }
        h3 { color: #7A5C3A; margin-top: 18px; }
        .meta { background: #FDF6EC; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #D9C9A8; }
        pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
        strong { font-weight: 800; }
      </style></head>
      <body>
        <h1>IEPrep — Differentiated Lesson Plan</h1>
        <div class="meta">
          <strong>Subject:</strong> ${subject} | <strong>Grade:</strong> ${grade}<br/>
          <strong>SOLs:</strong> ${sols.map((s) => `${subject} ${grade}.${s}`).join(", ")}<br/>
          <strong>Disability Types:</strong> ${disabilityTypes.join(", ") || "Not specified"}<br/>
          <strong>Duration:</strong> ${duration} min × ${weeks} week(s)<br/>
          <strong>Accommodations:</strong> ${selectedAccommodations.join(", ") || "None selected"}
        </div>
        <pre>${lessonPlan}</pre>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  const btnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    padding: "10px 16px", borderRadius: "12px", border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: "0.85rem", transition: "all 0.15s",
  };

  return (
    <>
      <LessonHistory onLoadLesson={onLoadLesson} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Config */}
      <div className="gg-card p-6 space-y-5">
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gg-green)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          🌿 Configure Lesson Plan
        </h2>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "8px", background: "var(--gg-beige-pale)", padding: "4px", borderRadius: "8px" }}>
          {(["class", "student"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSols([]); setLoadedClass(null); setLoadedStudent(null); }}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: "6px", border: "none",
                background: mode === m ? "var(--gg-white)" : "transparent",
                color: mode === m ? "var(--gg-green)" : "var(--gg-brown-mid)",
                fontWeight: mode === m ? 700 : 600,
                fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s",
                borderBottom: mode === m ? "2px solid var(--gg-green)" : "none",
              }}
            >
              {m === "class" ? "📚 Class Mode" : "👤 Student Mode"}
            </button>
          ))}
        </div>

        {/* Quick load — Class Mode */}
        {mode === "class" && (
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "6px", letterSpacing: "0.05em" }}>SELECT CLASS</p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_STUDENTS.map((s) => (
                <button key={s.id} onClick={() => loadDemoStudent(s.id)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "20px",
                  border: loadedStudent === s.id ? "1.5px solid var(--gg-green)" : "1.5px solid var(--gg-card-border)",
                  background: loadedStudent === s.id ? "var(--gg-green-pale)" : "var(--gg-white)",
                  color: loadedStudent === s.id ? "var(--gg-green)" : "var(--gg-brown-mid)",
                  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                }}>
                  <UserCheck className="w-3.5 h-3.5" /> Student {s.id}
                </button>
              ))}
            </div>
            {loadedClass && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", padding: "6px 12px", background: "var(--gg-green-pale)", borderRadius: "10px", border: "1px solid var(--gg-green-light)" }}>
                <Users className="w-4 h-4" style={{ color: "var(--gg-green)" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--gg-green)", fontWeight: 600 }}>
                  Loaded: {loadedClass.name} ({loadedClass.students.length} students)
                </span>
                <button onClick={() => setShowAddStudentModal(true)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--gg-green)", padding: "0 4px", display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
                </button>
                <button onClick={() => { setLoadedClass(null); onClearClass?.(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gg-green)" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick load — Student Mode */}
        {mode === "student" && (
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "6px", letterSpacing: "0.05em" }}>SELECT STUDENT</p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_STUDENTS.map((s) => (
                <button key={s.id} onClick={() => loadDemoStudent(s.id)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "20px",
                  border: loadedStudent === s.id ? "1.5px solid var(--gg-green)" : "1.5px solid var(--gg-card-border)",
                  background: loadedStudent === s.id ? "var(--gg-green-pale)" : "var(--gg-white)",
                  color: loadedStudent === s.id ? "var(--gg-green)" : "var(--gg-brown-mid)",
                  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                }}>
                  <UserCheck className="w-3.5 h-3.5" /> Student {s.id}
                </button>
              ))}
            </div>
            {loadedStudent && (
              <div style={{ marginTop: "8px", padding: "8px 12px", background: "var(--gg-pink-pale)", borderRadius: "8px", border: "1px solid var(--gg-pink-light)", fontSize: "0.75rem", color: "var(--gg-brown)" }}>
                📌 Generating lesson for Student {loadedStudent} only
              </div>
            )}
          </div>
        )}

        {/* Subject + Grade */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>Subject</label>
            <select value={subject} onChange={(e) => { setSubject(e.target.value as Subject); setSols([]); }} className="gg-input w-full px-3 py-2 text-sm">
              <option>Math</option>
              <option>ELA</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>Grade</label>
            <select value={grade} onChange={(e) => { setGrade(e.target.value as Grade); setSols([]); }} className="gg-input w-full px-3 py-2 text-sm">
              <option value="6">6th Grade</option>
              <option value="7">7th Grade</option>
              <option value="8">8th Grade</option>
            </select>
          </div>
        </div>

        {/* Multi-SOL selector */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)" }}>Virginia SOLs</label>
            <span style={{ fontSize: "0.7rem", color: sols.length >= 4 ? "var(--gg-pink)" : "var(--gg-brown-mid)" }}>
              {sols.length}/4 selected
            </span>
          </div>
          <select
            value=""
            onChange={(e) => addSol(e.target.value)}
            className="gg-input w-full px-3 py-2 text-sm"
            disabled={sols.length >= 4}
          >
            <option value="">Add a standard{sols.length >= 4 ? " (max 4 reached)" : "..."}  </option>
            {solsForGrade.filter((s) => !sols.includes(s.id)).map((s) => (
              <option key={s.id} value={s.id}>{s.id} — {s.desc}</option>
            ))}
          </select>
          {sols.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {sols.map((s) => {
                const sol = solsForGrade.find((x) => x.id === s);
                return (
                  <span key={s} style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    fontSize: "0.75rem", fontWeight: 600,
                    background: "var(--gg-green-pale)", color: "var(--gg-green)",
                    border: "1px solid var(--gg-green-light)", borderRadius: "20px", padding: "3px 10px",
                  }}>
                    {subject} {grade}.{s}{sol ? ` — ${sol.desc}` : ""}
                    <button onClick={() => removeSol(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--gg-green)", lineHeight: 1 }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Duration & Weeks */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="gg-input w-full px-3 py-2 text-sm">
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>Timeframe</label>
            <select value={weeks} onChange={(e) => setWeeks(e.target.value)} className="gg-input w-full px-3 py-2 text-sm">
              <option value="1">1 week</option>
              <option value="2">2 weeks</option>
              <option value="3">3 weeks</option>
              <option value="4">4 weeks</option>
            </select>
          </div>
        </div>

        {/* Multi-disability selector */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)" }}>Disability Categories</label>
            <span style={{ fontSize: "0.7rem", color: "var(--gg-brown-mid)" }}>{disabilityTypes.length} selected (up to 10)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {DISABILITY_TYPES.map((d) => (
              <label key={d} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", cursor: "pointer", color: "var(--gg-brown)" }}>
                <input type="checkbox" checked={disabilityTypes.includes(d)} onChange={() => toggleDisability(d)}
                  style={{ accentColor: "var(--gg-green)", width: "14px", height: "14px" }} />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* Accommodations */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "6px" }}>Accommodations</label>
          <div className="grid grid-cols-2 gap-2">
            {ACCOMMODATIONS.map((acc) => (
              <label key={acc} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.8rem", cursor: "pointer", color: "var(--gg-brown)" }}>
                <input type="checkbox" checked={selectedAccommodations.includes(acc)} onChange={() => toggleAccommodation(acc)}
                  style={{ accentColor: "var(--gg-green)", width: "14px", height: "14px" }} />
                {acc}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>Student / Class Notes</label>
          <textarea value={studentNeeds} onChange={(e) => setStudentNeeds(e.target.value)} rows={3}
            placeholder="e.g., 3rd grade reading level, benefits from visual models, mixed class of 6 students..."
            className="gg-input w-full px-3 py-2 text-sm resize-none" />
        </div>

        <button onClick={generateLesson} disabled={sols.length === 0 || loading || (mode === "class" && !loadedClass) || (mode === "student" && !loadedStudent)}
          style={{
            ...btnBase, width: "100%",
            background: (sols.length === 0 || loading || (mode === "class" && !loadedClass) || (mode === "student" && !loadedStudent)) ? "var(--gg-beige-dark)" : "var(--gg-green)",
            color: (sols.length === 0 || loading) ? "var(--gg-brown-mid)" : "white",
            boxShadow: (sols.length === 0 || loading || (mode === "class" && !loadedClass) || (mode === "student" && !loadedStudent)) ? "none" : "3px 4px 0px #2E5A18",
            cursor: (sols.length === 0 || loading) ? "not-allowed" : "pointer",
          }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Differentiated Lesson Plan"}
        </button>
      </div>

      {/* Right: Output */}
      <div className="gg-card p-6 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gg-green)", margin: 0 }}>📄 Lesson Plan</h2>
          {lessonPlan && (
            <div className="flex items-center gap-2">
              {slides && slidesLoading === null && (
                <button onClick={() => setShowSlides(true)} style={{
                  display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", fontWeight: 700,
                  padding: "6px 12px", borderRadius: "20px", border: "none",
                  background: "var(--gg-pink)", color: "white", cursor: "pointer", boxShadow: "2px 3px 0px #B85872",
                }}>
                  <Presentation className="w-3.5 h-3.5" /> Present
                </button>
              )}
              <button onClick={downloadPDF} style={{
                display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", fontWeight: 600,
                padding: "6px 12px", borderRadius: "20px", border: "1.5px solid var(--gg-sky-dark)",
                background: "var(--gg-white)", color: "var(--gg-sky-dark)", cursor: "pointer",
              }}>
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          )}
        </div>

        {/* Day session → slides picker */}
        {lessonPlan && !loading && (
          sessions.length > 0 ? (
            <div style={{ background: "var(--gg-green-pale)", border: "1.5px solid var(--gg-green-light)", borderRadius: "12px", padding: "12px 14px", marginBottom: "14px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 800, color: "var(--gg-green)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Presentation className="w-4 h-4" /> Create Smart Board slides for one class period
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {sessions.map((sess) => (
                  <button key={sess.label} onClick={() => createSlides(sess)} disabled={slidesLoading !== null}
                    title={sess.title}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      fontSize: "0.76rem", fontWeight: 700, padding: "6px 11px", borderRadius: "18px",
                      border: "1.5px solid var(--gg-green)", background: "var(--gg-white)",
                      color: "var(--gg-green)", cursor: slidesLoading !== null ? "wait" : "pointer",
                      opacity: slidesLoading !== null && slidesLoading !== sess.label ? 0.5 : 1,
                    }}>
                    {slidesLoading === sess.label ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
                    {sess.label}
                  </button>
                ))}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: "0.7rem", color: "var(--gg-brown-mid)" }}>
                Each button builds a ~12-slide deck for that single day. Click a day, then press Present.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "14px" }}>
              <button onClick={() => createSlides()} disabled={slidesLoading !== null} style={{
                display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", fontWeight: 700,
                padding: "8px 14px", borderRadius: "20px", border: "1.5px solid var(--gg-pink)",
                background: "var(--gg-white)", color: "var(--gg-pink)", cursor: "pointer", opacity: slidesLoading !== null ? 0.5 : 1,
              }}>
                {slidesLoading !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
                {slidesLoading !== null ? "Building slides..." : "Create Slides"}
              </button>
            </div>
          )
        )}

        {!lessonPlan && !loading && (
          <div className="flex-1 flex items-center justify-center text-center" style={{ color: "var(--gg-brown-mid)" }}>
            <div>
              <Wand2 className="w-10 h-10 mx-auto mb-3" style={{ opacity: 0.25 }} />
              <p style={{ fontSize: "0.9rem" }}>Configure the lesson on the left and click Generate</p>
              <p style={{ marginTop: "4px", fontSize: "0.78rem", opacity: 0.7 }}>AI will create a fully differentiated lesson plan tailored to your students</p>
            </div>
          </div>
        )}

        {loading && !lessonPlan && (
          <div className="flex-1 flex items-center justify-center" style={{ color: "var(--gg-brown-mid)" }}>
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "var(--gg-green)" }} />
              <p style={{ fontSize: "0.85rem" }}>Claude is thinking through the best approach for your students...</p>
            </div>
          </div>
        )}

        {lessonPlan && (
          <div className="flex-1 overflow-y-auto" style={{
            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "0.85rem", color: "var(--gg-brown)", lineHeight: 1.65,
          }}>
            {renderLessonPlan(lessonPlan)}
          </div>
        )}
      </div>

      {showSlides && slides && (
        <SlideViewer slides={slides} onClose={() => setShowSlides(false)} />
      )}
      </div>

      {loadedClass && (
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          schoolClass={loadedClass}
          onAddStudent={handleAddStudentToClass}
        />
      )}
    </>
  );
}
