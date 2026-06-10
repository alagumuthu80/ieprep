"use client";

import { useState, useRef } from "react";
import { VA_SOLS, DISABILITY_TYPES, ACCOMMODATIONS, DEMO_STUDENTS } from "@/lib/data";
import { Wand2, Download, Loader2, UserCheck, Presentation } from "lucide-react";
import SlideViewer, { type Slide } from "@/components/SlideViewer";

type Subject = "Math" | "ELA";
type Grade = "6" | "7" | "8";

export default function LessonPlanGenerator() {
  const [subject, setSubject] = useState<Subject>("Math");
  const [grade, setGrade] = useState<Grade>("8");
  const [sol, setSol] = useState("");
  const [weeks, setWeeks] = useState("2");
  const [duration, setDuration] = useState("60");
  const [disabilityType, setDisabilityType] = useState(DISABILITY_TYPES[0]);
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [studentNeeds, setStudentNeeds] = useState("");
  const [lessonPlan, setLessonPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedStudent, setLoadedStudent] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [showSlides, setShowSlides] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const solsForGrade = VA_SOLS[subject][grade];

  function loadDemoStudent(studentId: string) {
    const student = DEMO_STUDENTS.find((s) => s.id === studentId);
    if (!student) return;
    setGrade(student.grade as Grade);
    setDisabilityType(student.disabilityType);
    setSelectedAccommodations(student.accommodations);
    setStudentNeeds(`Student ${studentId}: ${student.readingLevel} reading level. ${student.name}.`);
    setLoadedStudent(studentId);
  }

  function toggleAccommodation(acc: string) {
    setSelectedAccommodations((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  }

  async function generateLesson() {
    if (!sol) return;
    setLessonPlan("");
    setLoading(true);
    abortRef.current = new AbortController();

    const studentGoals =
      loadedStudent
        ? DEMO_STUDENTS.find((s) => s.id === loadedStudent)?.goals.map((g) => ({
            area: g.area,
            goal: g.goal,
            progress: g.trials.length ? g.trials[g.trials.length - 1].score : "N/A",
            lastScore: g.trials.length ? g.trials[g.trials.length - 1].score : "N/A",
          }))
        : undefined;

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade,
          sol: `${subject} ${grade}.${sol}`,
          weeks,
          duration,
          disabilityType,
          accommodations: selectedAccommodations,
          studentNeeds,
          studentGoals,
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

  async function createSlides() {
    setSlidesLoading(true);
    try {
      const res = await fetch("/api/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonPlan, grade, subject, disabilityType }),
      });
      const data = await res.json();
      if (data.slides) {
        setSlides(data.slides);
        setShowSlides(true);
      }
    } catch {
      alert("Error generating slides. Please try again.");
    } finally {
      setSlidesLoading(false);
    }
  }

  function downloadPDF() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>IEPrep Lesson Plan</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
        h1 { color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 8px; }
        h2 { color: #1e40af; margin-top: 24px; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
        .meta { background: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
      </style></head>
      <body>
        <h1>IEPrep — Differentiated Lesson Plan</h1>
        <div class="meta">
          <strong>Subject:</strong> ${subject} | <strong>Grade:</strong> ${grade} | <strong>SOL:</strong> ${sol}<br/>
          <strong>Disability:</strong> ${disabilityType}<br/>
          <strong>Duration:</strong> ${duration} min × ${weeks} week(s)<br/>
          <strong>Accommodations:</strong> ${selectedAccommodations.join(", ") || "None selected"}
        </div>
        <pre>${lessonPlan}</pre>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Config */}
      <div className="gg-card p-6 space-y-5">
        <h2 style={{ fontSize:"1.05rem", fontWeight:700, color:"var(--gg-green)", margin:0, display:"flex", alignItems:"center", gap:"8px" }}>
          🌿 Configure Lesson Plan
        </h2>

        {/* Load demo student */}
        <div>
          <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"6px", letterSpacing:"0.05em" }}>QUICK LOAD — DEMO STUDENTS</p>
          <div className="flex gap-2">
            {DEMO_STUDENTS.map((s) => (
              <button
                key={s.id}
                onClick={() => loadDemoStudent(s.id)}
                style={{
                  display:"flex", alignItems:"center", gap:"6px",
                  padding:"6px 12px", borderRadius:"20px",
                  border: loadedStudent === s.id ? "1.5px solid var(--gg-green)" : "1.5px solid var(--gg-card-border)",
                  background: loadedStudent === s.id ? "var(--gg-green-pale)" : "var(--gg-white)",
                  color: loadedStudent === s.id ? "var(--gg-green)" : "var(--gg-brown-mid)",
                  fontWeight: 600, fontSize:"0.8rem", cursor:"pointer",
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Student {s.id}
              </button>
            ))}
          </div>
          {loadedStudent && (
            <p style={{ fontSize:"0.72rem", color:"var(--gg-green)", marginTop:"4px" }}>
              ✓ Loaded: {DEMO_STUDENTS.find((s) => s.id === loadedStudent)?.name} — goals embedded in lesson
            </p>
          )}
        </div>

        {/* Subject + Grade */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Subject</label>
            <select
              value={subject}
              onChange={(e) => { setSubject(e.target.value as Subject); setSol(""); }}
              className="gg-input w-full px-3 py-2 text-sm"
            >
              <option>Math</option>
              <option>ELA</option>
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Grade</label>
            <select
              value={grade}
              onChange={(e) => { setGrade(e.target.value as Grade); setSol(""); }}
              className="gg-input w-full px-3 py-2 text-sm"
            >
              <option value="6">6th Grade</option>
              <option value="7">7th Grade</option>
              <option value="8">8th Grade</option>
            </select>
          </div>
        </div>

        {/* SOL */}
        <div>
          <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Virginia SOL</label>
          <select
            value={sol}
            onChange={(e) => setSol(e.target.value)}
            className="gg-input w-full px-3 py-2 text-sm"
          >
            <option value="">Select a standard...</option>
            {solsForGrade.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Duration & Weeks */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Lesson Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="gg-input w-full px-3 py-2 text-sm"
            >
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Timeframe</label>
            <select
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              className="gg-input w-full px-3 py-2 text-sm"
            >
              <option value="1">1 week</option>
              <option value="2">2 weeks</option>
              <option value="3">3 weeks</option>
              <option value="4">4 weeks</option>
            </select>
          </div>
        </div>

        {/* Disability */}
        <div>
          <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Disability Type</label>
          <select
            value={disabilityType}
            onChange={(e) => setDisabilityType(e.target.value)}
            className="gg-input w-full px-3 py-2 text-sm"
          >
            {DISABILITY_TYPES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Accommodations */}
        <div>
          <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"6px" }}>Accommodations</label>
          <div className="grid grid-cols-2 gap-2">
            {ACCOMMODATIONS.map((acc) => (
              <label key={acc} style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"0.8rem", cursor:"pointer", color:"var(--gg-brown)" }}>
                <input
                  type="checkbox"
                  checked={selectedAccommodations.includes(acc)}
                  onChange={() => toggleAccommodation(acc)}
                  style={{ accentColor:"var(--gg-green)", width:"14px", height:"14px" }}
                />
                {acc}
              </label>
            ))}
          </div>
        </div>

        {/* Student needs */}
        <div>
          <label style={{ display:"block", fontSize:"0.8rem", fontWeight:700, color:"var(--gg-brown-mid)", marginBottom:"4px" }}>Student Needs / Notes</label>
          <textarea
            value={studentNeeds}
            onChange={(e) => setStudentNeeds(e.target.value)}
            rows={3}
            placeholder="e.g., 3rd grade reading level, struggles with multi-step problems, benefits from visual models..."
            className="gg-input w-full px-3 py-2 text-sm resize-none"
          />
        </div>

        <button
          onClick={generateLesson}
          disabled={!sol || loading}
          style={{
            width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
            padding:"11px", borderRadius:"12px", border:"none", cursor: (!sol || loading) ? "not-allowed" : "pointer",
            background: (!sol || loading) ? "var(--gg-beige-dark)" : "var(--gg-green)",
            color: (!sol || loading) ? "var(--gg-brown-mid)" : "white",
            fontWeight:700, fontSize:"0.88rem", transition:"all 0.15s",
            boxShadow: (!sol || loading) ? "none" : "3px 4px 0px #2E5A18",
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Differentiated Lesson Plan"}
        </button>
      </div>

      {/* Right: Output */}
      <div className="gg-card p-6 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize:"1.05rem", fontWeight:700, color:"var(--gg-green)", margin:0 }}>📄 Lesson Plan</h2>
          {lessonPlan && (
            <div className="flex items-center gap-2">
              <button
                onClick={createSlides}
                disabled={slidesLoading}
                style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.78rem", fontWeight:600, padding:"6px 12px", borderRadius:"20px", border:"1.5px solid var(--gg-pink)", background:"var(--gg-white)", color:"var(--gg-pink)", cursor:"pointer", opacity: slidesLoading ? 0.5 : 1 }}
              >
                {slidesLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
                {slidesLoading ? "Building slides..." : slides ? "View Slides" : "Create Slides"}
              </button>
              {slides && !slidesLoading && (
                <button
                  onClick={() => setShowSlides(true)}
                  style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.78rem", fontWeight:700, padding:"6px 12px", borderRadius:"20px", border:"none", background:"var(--gg-pink)", color:"white", cursor:"pointer", boxShadow:"2px 3px 0px #B85872" }}
                >
                  <Presentation className="w-3.5 h-3.5" />
                  Present
                </button>
              )}
              <button
                onClick={downloadPDF}
                style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.78rem", fontWeight:600, padding:"6px 12px", borderRadius:"20px", border:"1.5px solid var(--gg-sky-dark)", background:"var(--gg-white)", color:"var(--gg-sky-dark)", cursor:"pointer" }}
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          )}
        </div>

        {!lessonPlan && !loading && (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm text-center">
            <div>
              <Wand2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Configure the lesson on the left and click Generate</p>
              <p className="mt-1 text-xs">AI will create a fully differentiated lesson plan tailored to the student&apos;s needs</p>
            </div>
          </div>
        )}

        {loading && !lessonPlan && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
              <p className="text-sm">Claude is thinking through the best approach for this student...</p>
            </div>
          </div>
        )}

        {lessonPlan && (
          <div className="flex-1 overflow-y-auto">
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
              {lessonPlan}
            </div>
          </div>
        )}
      </div>

      {showSlides && slides && (
        <SlideViewer slides={slides} onClose={() => setShowSlides(false)} />
      )}
    </div>
  );
}
