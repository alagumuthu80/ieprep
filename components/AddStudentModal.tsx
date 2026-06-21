"use client";

import { useState } from "react";
import { X, Plus, Trash2, Target } from "lucide-react";
import { GOAL_AREAS } from "@/lib/data";
import type { SchoolClass, ClassStudentEntry, StudentGoal } from "@/lib/data";

type GoalDraft = { area: string; goal: string; targetDate: string };

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolClass: SchoolClass;
  onAddStudent: (updatedClass: SchoolClass) => void;
}

export default function AddStudentModal({ isOpen, onClose, schoolClass, onAddStudent }: AddStudentModalProps) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [disabilityCategory, setDisabilityCategory] = useState("SLD");
  const [readingLevel, setReadingLevel] = useState("grade-level");
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [goals, setGoals] = useState<GoalDraft[]>([]);
  const [error, setError] = useState("");

  function addGoal() {
    setGoals([...goals, { area: GOAL_AREAS[0], goal: "", targetDate: "" }]);
  }
  function updateGoal(i: number, patch: Partial<GoalDraft>) {
    setGoals(goals.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function removeGoal(i: number) {
    setGoals(goals.filter((_, idx) => idx !== i));
  }

  const disabilityOptions = ["SLD", "OHI/ADHD", "ASD", "EBD", "ID", "VI", "HI", "OI"];
  const readingLevelOptions = [
    { value: "2-3", label: "2nd-3rd grade" },
    { value: "3-4", label: "3rd-4th grade" },
    { value: "4-5", label: "4th-5th grade" },
    { value: "grade-level", label: "Grade level" },
    { value: "advanced", label: "Advanced" },
  ];
  const accommodationOptions = [
    "Extended time",
    "Oral instructions",
    "Simplified language",
    "Visual supports",
    "Manipulatives",
    "Adaptive tech",
    "Frequent breaks",
    "Preferential seating",
  ];

  function handleAddStudent() {
    setError("");
    if (!studentId.trim()) {
      setError("Student ID required");
      return;
    }
    if (!name.trim()) {
      setError("Student name required");
      return;
    }
    if (schoolClass.students.some(s => s.id === studentId)) {
      setError("Student ID already exists in this class");
      return;
    }

    const cleanGoals: StudentGoal[] = goals
      .filter(g => g.goal.trim())
      .map((g, i) => ({
        id: `goal_${Date.now()}_${i}`,
        area: g.area,
        goal: g.goal.trim(),
        targetDate: g.targetDate || undefined,
        trials: [],
      }));

    const newStudent: ClassStudentEntry = {
      id: studentId,
      name,
      grade: schoolClass.grade,
      disabilityType: disabilityCategory,
      accommodations,
      readingLevel,
      ...(cleanGoals.length ? { goals: cleanGoals } : {}),
    };

    const updatedClass: SchoolClass = {
      ...schoolClass,
      students: [...schoolClass.students, newStudent],
    };

    onAddStudent(updatedClass);
    setStudentId("");
    setName("");
    setDisabilityCategory("SLD");
    setReadingLevel("grade-level");
    setAccommodations([]);
    setGoals([]);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }} onClick={onClose}>
      <div
        style={{
          background: "var(--gg-white)", borderRadius: "12px",
          border: "1.5px solid var(--gg-card-border)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          padding: "20px", maxWidth: "440px", width: "90%",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--gg-green)" }}>
            Add Student to {schoolClass.name}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="Close"
          >
            <X size={20} color="var(--gg-brown-mid)" />
          </button>
        </div>

        {error && (
          <div style={{
            background: "var(--gg-pink-pale)", color: "var(--gg-pink)",
            padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem",
            marginBottom: "12px", borderLeft: "3px solid var(--gg-pink)",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>
              Student ID *
            </label>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="e.g., 11112"
              className="gg-input w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>
              Student Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Alex R."
              className="gg-input w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>
              Disability Category
            </label>
            <select
              value={disabilityCategory}
              onChange={e => setDisabilityCategory(e.target.value)}
              className="gg-input w-full px-3 py-2 text-sm"
            >
              {disabilityOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>
              Reading Level
            </label>
            <select
              value={readingLevel}
              onChange={e => setReadingLevel(e.target.value)}
              className="gg-input w-full px-3 py-2 text-sm"
            >
              {readingLevelOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--gg-brown-mid)", marginBottom: "6px" }}>
              Accommodations
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {accommodationOptions.map(acc => (
                <label key={acc} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.8rem" }}>
                  <input
                    type="checkbox"
                    checked={accommodations.includes(acc)}
                    onChange={e => {
                      if (e.target.checked) {
                        setAccommodations([...accommodations, acc]);
                      } else {
                        setAccommodations(accommodations.filter(a => a !== acc));
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  {acc}
                </label>
              ))}
            </div>
          </div>

          {/* IEP Goals */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", fontWeight: 600, color: "var(--gg-brown-mid)" }}>
                <Target size={14} /> IEP Goals <span style={{ fontWeight: 400, color: "var(--gg-brown-mid)" }}>(optional)</span>
              </label>
              <button
                onClick={addGoal}
                type="button"
                style={{ display: "flex", alignItems: "center", gap: "3px", background: "var(--gg-green-pale)", color: "var(--gg-green)", border: "1px solid var(--gg-green-light)", borderRadius: "6px", padding: "3px 8px", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
              >
                <Plus size={12} /> Add goal
              </button>
            </div>

            {goals.length === 0 && (
              <p style={{ fontSize: "0.72rem", color: "var(--gg-brown-mid)", margin: "0 0 4px" }}>
                Add measurable IEP goals so lessons can target them. Progress trials are logged later.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {goals.map((g, i) => (
                <div key={i} style={{ border: "1px solid var(--gg-card-border)", borderRadius: "8px", padding: "8px", background: "var(--gg-beige-pale)" }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                    <select
                      value={g.area}
                      onChange={e => updateGoal(i, { area: e.target.value })}
                      className="gg-input text-sm"
                      style={{ flex: 1, padding: "5px 8px" }}
                    >
                      {GOAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <input
                      type="date"
                      value={g.targetDate}
                      onChange={e => updateGoal(i, { targetDate: e.target.value })}
                      className="gg-input text-sm"
                      style={{ padding: "5px 8px" }}
                      title="Target date"
                    />
                    <button
                      onClick={() => removeGoal(i)}
                      type="button"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gg-pink)", padding: "0 2px" }}
                      aria-label="Remove goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={g.goal}
                    onChange={e => updateGoal(i, { goal: e.target.value })}
                    placeholder="e.g., Given grade-level text, Alex will identify the main idea and 2 details with 80% accuracy across 3 consecutive trials."
                    rows={2}
                    className="gg-input w-full text-sm"
                    style={{ padding: "6px 8px", resize: "vertical" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={handleAddStudent}
              style={{
                flex: 1, padding: "10px", background: "var(--gg-green)", color: "white",
                border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
                fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              <Plus size={16} /> Add Student
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "10px", background: "var(--gg-beige)", color: "var(--gg-brown-mid)",
                border: "1.5px solid var(--gg-card-border)", borderRadius: "6px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.85rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
