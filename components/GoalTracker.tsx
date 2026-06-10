"use client";

import { useState } from "react";
import { DEMO_STUDENTS, getProgressLevel, daysUntilDate } from "@/lib/data";
import { TrendingUp, AlertTriangle, CheckCircle, Loader2, Brain } from "lucide-react";

const SCORE_PILL: Record<string, { bg: string; color: string; border: string }> = {
  "1/4": { bg:"#FDEAEA", color:"#A32D2D", border:"#F09595" },
  "2/4": { bg:"#FFF3D6", color:"#854F0B", border:"#FAC775" },
  "3/4": { bg:"#FFF9D6", color:"#635800", border:"#EDD900" },
  "4/4": { bg:"#EDFBD8", color:"#27500A", border:"#97C459" },
};

const PROGRESS_CONFIG = {
  emerging:   { label: "Emerging",           barColor:"var(--gg-pink)",         pct:"25%" },
  developing: { label: "Developing",         barColor:"var(--gg-sun)",          pct:"50%" },
  approaching:{ label: "Approaching Mastery",barColor:"var(--gg-green-light)",  pct:"75%" },
  mastered:   { label: "Mastered 🌟",        barColor:"var(--gg-green)",        pct:"100%" },
};

type TrialScore = "1/4" | "2/4" | "3/4" | "4/4";

export default function GoalTracker() {
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState(DEMO_STUDENTS[0].id);
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [newTrials, setNewTrials] = useState<Record<string, { score: TrialScore; notes: string }>>({});

  const student = students.find((s) => s.id === selectedStudentId)!;

  function addTrial(goalId: string) {
    const trial = newTrials[goalId];
    if (!trial?.score) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id !== selectedStudentId
          ? s
          : {
              ...s,
              goals: s.goals.map((g) =>
                g.id !== goalId
                  ? g
                  : {
                      ...g,
                      trials: [
                        ...g.trials,
                        {
                          date: new Date().toISOString().split("T")[0],
                          score: trial.score,
                          notes: trial.notes || "",
                        },
                      ],
                    }
              ),
            }
      )
    );
    setNewTrials((prev) => ({ ...prev, [goalId]: { score: "1/4", notes: "" } }));
  }

  async function getAISuggestions() {
    setAiSuggestions("");
    setLoadingAI(true);

    const goals = student.goals.map((g) => {
      const progress = getProgressLevel(g.trials);
      const lastTrial = g.trials[g.trials.length - 1];
      const scores = g.trials.map((t) => t.score);
      const trend =
        scores.length >= 2
          ? scores[scores.length - 1] > scores[scores.length - 2]
            ? "improving"
            : scores[scores.length - 1] < scores[scores.length - 2]
            ? "declining"
            : "stable"
          : "insufficient data";

      return {
        area: g.area,
        goal: g.goal,
        progress,
        trend,
        daysLeft: daysUntilDate(g.targetDate),
        lastScore: lastTrial?.score || "N/A",
      };
    });

    try {
      const res = await fetch("/api/adjust-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name,
          disabilityType: student.disabilityType,
          goals,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAiSuggestions((prev) => prev + decoder.decode(value));
      }
    } catch {
      setAiSuggestions("Error getting AI suggestions. Please check your API key.");
    } finally {
      setLoadingAI(false);
    }
  }

  const ggInput: React.CSSProperties = {
    background:"var(--gg-white)", border:"1.5px solid var(--gg-card-border)",
    borderRadius:"10px", color:"var(--gg-brown)", fontSize:"0.83rem", padding:"6px 10px",
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      {/* Student selector */}
      <div style={{ display:"flex", gap:"10px" }}>
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStudentId(s.id)}
            style={{
              padding:"8px 18px", borderRadius:"22px",
              border: selectedStudentId === s.id ? "1.5px solid var(--gg-green)" : "1.5px solid var(--gg-card-border)",
              background: selectedStudentId === s.id ? "var(--gg-green)" : "var(--gg-white)",
              color: selectedStudentId === s.id ? "white" : "var(--gg-brown-mid)",
              fontWeight:700, fontSize:"0.85rem", cursor:"pointer",
              boxShadow: selectedStudentId === s.id ? "2px 3px 0px #2E5A18" : "2px 3px 0px var(--gg-beige-dark)",
            }}
          >
            🌱 {s.name} <span style={{ opacity:0.6 }}>#{s.id}</span>
          </button>
        ))}
      </div>

      {/* Student info card */}
      <div className="gg-card" style={{ padding:"18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h2 style={{ margin:0, fontSize:"1.2rem", fontWeight:800, color:"var(--gg-brown)" }}>{student.name}</h2>
            <p style={{ margin:"2px 0 8px", fontSize:"0.8rem", color:"var(--gg-brown-mid)" }}>
              Grade {student.grade} · {student.disabilityType} · Reading at {student.readingLevel}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {student.accommodations.map((acc) => (
                <span key={acc} style={{
                  fontSize:"0.72rem", fontWeight:600,
                  background:"var(--gg-green-pale)", color:"var(--gg-green)",
                  border:"1px solid var(--gg-green-light)", borderRadius:"20px", padding:"2px 10px"
                }}>{acc}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign:"right", display:"flex", flexDirection:"column", gap:"4px" }}>
            {student.goals.map((g) => {
              const days = daysUntilDate(g.targetDate);
              if (days <= 60) return (
                <div key={g.id} style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"0.75rem", color: days <= 30 ? "#A32D2D" : "#854F0B", background: days <= 30 ? "#FDEAEA" : "#FFF3D6", borderRadius:"12px", padding:"3px 10px" }}>
                  <AlertTriangle className="w-3 h-3" />
                  {g.area}: {days}d left
                </div>
              );
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {student.goals.map((goal) => {
          const progress = getProgressLevel(goal.trials);
          const config = PROGRESS_CONFIG[progress];
          const days = daysUntilDate(goal.targetDate);
          const trial = newTrials[goal.id] || { score: "1/4" as TrialScore, notes: "" };

          return (
            <div key={goal.id} className="gg-card" style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                <div>
                  <span style={{ fontSize:"0.68rem", fontWeight:800, color:"var(--gg-green)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{goal.area}</span>
                  <p style={{ margin:"4px 0 0", fontSize:"0.82rem", color:"var(--gg-brown)", lineHeight:1.45 }}>{goal.goal}</p>
                </div>
                {progress === "mastered" && <CheckCircle style={{ color:"var(--gg-green)", flexShrink:0, width:"20px", height:"20px" }} />}
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.72rem", marginBottom:"5px" }}>
                  <span style={{ fontWeight:700, color:"var(--gg-brown-mid)" }}>{config.label}</span>
                  <span style={{ color: days <= 30 ? "#A32D2D" : days <= 60 ? "#854F0B" : "var(--gg-brown-mid)" }}>
                    {goal.targetDate} ({days}d)
                  </span>
                </div>
                <div style={{ width:"100%", background:"var(--gg-beige-dark)", borderRadius:"99px", height:"10px" }}>
                  <div style={{ background:config.barColor, width:config.pct, height:"10px", borderRadius:"99px", transition:"width 0.4s" }} />
                </div>
              </div>

              {/* Trial history */}
              <div>
                <p style={{ fontSize:"0.68rem", fontWeight:800, color:"var(--gg-brown-mid)", letterSpacing:"0.05em", marginBottom:"6px" }}>TRIAL HISTORY</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                  {goal.trials.map((t, i) => {
                    const pill = SCORE_PILL[t.score];
                    return (
                      <div key={i} className="group relative">
                        <span title={`${t.date}: ${t.notes || "No notes"}`} style={{
                          fontSize:"0.72rem", fontWeight:700, padding:"2px 9px",
                          borderRadius:"12px", border:`1px solid ${pill.border}`,
                          background:pill.bg, color:pill.color, cursor:"default"
                        }}>{t.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Log trial */}
              <div style={{ borderTop:"1.5px solid var(--gg-beige-dark)", paddingTop:"12px" }}>
                <p style={{ fontSize:"0.68rem", fontWeight:800, color:"var(--gg-brown-mid)", letterSpacing:"0.05em", marginBottom:"8px" }}>LOG NEW TRIAL</p>
                <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                  <select value={trial.score}
                    onChange={(e) => setNewTrials((prev) => ({ ...prev, [goal.id]: { ...trial, score: e.target.value as TrialScore } }))}
                    style={ggInput}
                  >
                    <option>1/4</option><option>2/4</option><option>3/4</option><option>4/4</option>
                  </select>
                  <input type="text" placeholder="Notes (optional)" value={trial.notes || ""}
                    onChange={(e) => setNewTrials((prev) => ({ ...prev, [goal.id]: { ...trial, notes: e.target.value } }))}
                    style={{ ...ggInput, flex:1 }}
                  />
                  <button onClick={() => addTrial(goal.id)} style={{
                    display:"flex", alignItems:"center", gap:"5px",
                    padding:"6px 14px", borderRadius:"20px", border:"none",
                    background:"var(--gg-green)", color:"white", fontWeight:700,
                    fontSize:"0.78rem", cursor:"pointer", boxShadow:"2px 3px 0px #2E5A18",
                    flexShrink:0,
                  }}>
                    <TrendingUp className="w-3.5 h-3.5" /> Log
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Suggestions */}
      <div className="gg-card" style={{ padding:"22px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontSize:"1.3rem" }}>🌻</span>
            <h3 style={{ margin:0, fontWeight:800, fontSize:"1rem", color:"var(--gg-green)" }}>AI Instructional Recommendations</h3>
          </div>
          <button onClick={getAISuggestions} disabled={loadingAI} style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"9px 16px", borderRadius:"22px", border:"none",
            background: loadingAI ? "var(--gg-beige-dark)" : "var(--gg-green)",
            color: loadingAI ? "var(--gg-brown-mid)" : "white",
            fontWeight:700, fontSize:"0.82rem", cursor: loadingAI ? "not-allowed" : "pointer",
            boxShadow: loadingAI ? "none" : "2px 3px 0px #2E5A18",
          }}>
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {loadingAI ? "Analyzing..." : "Analyze Progress & Recommend"}
          </button>
        </div>

        {!aiSuggestions && !loadingAI && (
          <p style={{ color:"var(--gg-brown-mid)", fontSize:"0.85rem" }}>
            Click the button to get AI-powered recommendations based on {student.name}&apos;s current goal progress.
          </p>
        )}
        {loadingAI && !aiSuggestions && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px", color:"var(--gg-brown-mid)", fontSize:"0.85rem" }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color:"var(--gg-green)" }} />
            Analyzing trial data and formulating recommendations...
          </div>
        )}
        {aiSuggestions && (
          <div style={{ fontSize:"0.85rem", color:"var(--gg-brown)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
            {aiSuggestions}
          </div>
        )}
      </div>
    </div>
  );
}
