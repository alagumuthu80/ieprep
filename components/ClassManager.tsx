"use client";

import { useState, useEffect } from "react";
import { DISABILITY_TYPES, ACCOMMODATIONS, DEMO_CLASSES } from "@/lib/data";
import type { SchoolClass, ClassStudentEntry, Grade, Subject } from "@/lib/data";
import { Plus, Trash2, Users, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

const STORAGE_KEY = "ieprep_classes";

function loadClasses(): SchoolClass[] {
  if (typeof window === "undefined") return DEMO_CLASSES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEMO_CLASSES;
  } catch {
    return DEMO_CLASSES;
  }
}

function saveClasses(classes: SchoolClass[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

const READING_LEVELS = ["Kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade", "5th grade", "6th grade", "7th grade", "8th grade", "On grade level"];

interface Props {
  onLoadClass: (cls: SchoolClass) => void;
}

export default function ClassManager({ onLoadClass }: Props) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [showNewClass, setShowNewClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState<string | null>(null); // classId

  // New class form
  const [newClassName, setNewClassName] = useState("");
  const [newClassPeriod, setNewClassPeriod] = useState("");
  const [newClassGrade, setNewClassGrade] = useState<Grade>("8");
  const [newClassSubject, setNewClassSubject] = useState<Subject>("ELA");

  // New student form
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState<Grade>("8");
  const [newStudentDisability, setNewStudentDisability] = useState(DISABILITY_TYPES[0]);
  const [newStudentAccommodations, setNewStudentAccommodations] = useState<string[]>([]);
  const [newStudentReading, setNewStudentReading] = useState("On grade level");

  useEffect(() => {
    setClasses(loadClasses());
  }, []);

  function createClass() {
    if (!newClassName.trim()) return;
    const cls: SchoolClass = {
      id: `cls_${Date.now()}`,
      name: newClassName.trim(),
      period: newClassPeriod.trim(),
      grade: newClassGrade,
      subject: newClassSubject,
      students: [],
    };
    const updated = [...classes, cls];
    setClasses(updated);
    saveClasses(updated);
    setNewClassName(""); setNewClassPeriod("");
    setShowNewClass(false);
    setExpandedClass(cls.id);
  }

  function deleteClass(id: string) {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    saveClasses(updated);
  }

  function addStudent(classId: string) {
    if (!newStudentName.trim()) return;
    const student: ClassStudentEntry = {
      id: `stu_${Date.now()}`,
      name: newStudentName.trim(),
      grade: newStudentGrade,
      disabilityType: newStudentDisability,
      accommodations: newStudentAccommodations,
      readingLevel: newStudentReading,
    };
    const updated = classes.map((c) =>
      c.id === classId ? { ...c, students: [...c.students, student] } : c
    );
    setClasses(updated);
    saveClasses(updated);
    setNewStudentName(""); setNewStudentAccommodations([]);
    setShowAddStudent(null);
  }

  function removeStudent(classId: string, studentId: string) {
    const updated = classes.map((c) =>
      c.id === classId ? { ...c, students: c.students.filter((s) => s.id !== studentId) } : c
    );
    setClasses(updated);
    saveClasses(updated);
  }

  function toggleStudentAccommodation(acc: string) {
    setNewStudentAccommodations((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  }

  const ggInput: React.CSSProperties = {
    background: "var(--gg-white)", border: "1.5px solid var(--gg-card-border)",
    borderRadius: "10px", color: "var(--gg-brown)", fontSize: "0.82rem", padding: "7px 10px",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--gg-green)" }}>🏫 My Classes</h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--gg-brown-mid)" }}>
            Create classes, add students, then load a class into the lesson generator
          </p>
        </div>
        <button onClick={() => setShowNewClass((v) => !v)} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "9px 16px", borderRadius: "22px", border: "none",
          background: "var(--gg-green)", color: "white",
          fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
          boxShadow: "2px 3px 0px #2E5A18",
        }}>
          <Plus className="w-4 h-4" /> New Class
        </button>
      </div>

      {/* New class form */}
      {showNewClass && (
        <div className="gg-card" style={{ padding: "18px 20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 800, color: "var(--gg-brown)" }}>Create New Class</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "3px" }}>Class Name *</label>
              <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g., Period 3 ELA" style={ggInput} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "3px" }}>Period</label>
              <input value={newClassPeriod} onChange={(e) => setNewClassPeriod(e.target.value)} placeholder="e.g., 3rd Period" style={ggInput} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "3px" }}>Grade</label>
              <select value={newClassGrade} onChange={(e) => setNewClassGrade(e.target.value as Grade)} style={ggInput}>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "3px" }}>Subject</label>
              <select value={newClassSubject} onChange={(e) => setNewClassSubject(e.target.value as Subject)} style={ggInput}>
                <option>Math</option>
                <option>ELA</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={createClass} disabled={!newClassName.trim()} style={{
              padding: "8px 18px", borderRadius: "20px", border: "none",
              background: newClassName.trim() ? "var(--gg-green)" : "var(--gg-beige-dark)",
              color: newClassName.trim() ? "white" : "var(--gg-brown-mid)",
              fontWeight: 700, fontSize: "0.82rem", cursor: newClassName.trim() ? "pointer" : "not-allowed",
              boxShadow: newClassName.trim() ? "2px 3px 0px #2E5A18" : "none",
            }}>Create Class</button>
            <button onClick={() => setShowNewClass(false)} style={{
              padding: "8px 18px", borderRadius: "20px", border: "1.5px solid var(--gg-card-border)",
              background: "var(--gg-white)", color: "var(--gg-brown-mid)",
              fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Class list */}
      {classes.length === 0 && !showNewClass && (
        <div className="gg-card" style={{ padding: "32px", textAlign: "center", color: "var(--gg-brown-mid)" }}>
          <Users className="w-10 h-10 mx-auto mb-3" style={{ opacity: 0.3 }} />
          <p style={{ fontSize: "0.9rem" }}>No classes yet. Click "New Class" to get started.</p>
        </div>
      )}

      {classes.map((cls) => (
        <div key={cls.id} className="gg-card" style={{ overflow: "hidden" }}>
          {/* Class header */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "var(--gg-brown)" }}>{cls.name}</h3>
                {cls.period && <span style={{ fontSize: "0.72rem", background: "var(--gg-beige-dark)", color: "var(--gg-brown-mid)", borderRadius: "10px", padding: "2px 8px", fontWeight: 600 }}>{cls.period}</span>}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--gg-brown-mid)" }}>
                Grade {cls.grade} · {cls.subject} · {cls.students.length} student{cls.students.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => onLoadClass(cls)} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 14px", borderRadius: "20px", border: "none",
                background: "var(--gg-green)", color: "white",
                fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
                boxShadow: "2px 3px 0px #2E5A18",
              }}>
                <BookOpen className="w-3.5 h-3.5" /> Load for Lesson
              </button>
              <button onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)} style={{
                padding: "7px 10px", borderRadius: "20px", border: "1.5px solid var(--gg-card-border)",
                background: "var(--gg-white)", color: "var(--gg-brown-mid)", cursor: "pointer",
              }}>
                {expandedClass === cls.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={() => deleteClass(cls.id)} style={{
                padding: "7px 10px", borderRadius: "20px", border: "1.5px solid #F09595",
                background: "#FDEAEA", color: "#A32D2D", cursor: "pointer",
              }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded: student roster */}
          {expandedClass === cls.id && (
            <div style={{ borderTop: "1.5px solid var(--gg-beige-dark)", padding: "16px 20px" }}>
              {cls.students.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                  {cls.students.map((stu) => (
                    <div key={stu.id} style={{
                      display: "flex", alignItems: "flex-start", gap: "10px",
                      background: "var(--gg-beige)", borderRadius: "10px", padding: "10px 12px",
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--gg-brown)" }}>🌱 {stu.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--gg-brown-mid)", marginLeft: "8px" }}>{stu.disabilityType}</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.68rem", background: "var(--gg-sky)", color: "#065A82", borderRadius: "10px", padding: "1px 7px", fontWeight: 600 }}>
                            Reading: {stu.readingLevel}
                          </span>
                          {stu.accommodations.map((acc) => (
                            <span key={acc} style={{ fontSize: "0.68rem", background: "var(--gg-green-pale)", color: "var(--gg-green)", borderRadius: "10px", padding: "1px 7px", fontWeight: 600 }}>
                              {acc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => removeStudent(cls.id, stu.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gg-brown-mid)", padding: "2px" }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add student button / form */}
              {showAddStudent === cls.id ? (
                <div style={{ background: "var(--gg-white)", borderRadius: "12px", border: "1.5px solid var(--gg-card-border)", padding: "14px" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem", fontWeight: 800, color: "var(--gg-brown)" }}>Add Student</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "2px" }}>Name *</label>
                      <input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Student name" style={ggInput} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "2px" }}>Reading Level</label>
                      <select value={newStudentReading} onChange={(e) => setNewStudentReading(e.target.value)} style={ggInput}>
                        {READING_LEVELS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "2px" }}>Disability Type</label>
                      <select value={newStudentDisability} onChange={(e) => setNewStudentDisability(e.target.value)} style={ggInput}>
                        {DISABILITY_TYPES.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--gg-brown-mid)", marginBottom: "4px" }}>Accommodations</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                        {ACCOMMODATIONS.map((acc) => (
                          <label key={acc} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", cursor: "pointer", color: "var(--gg-brown)" }}>
                            <input type="checkbox" checked={newStudentAccommodations.includes(acc)} onChange={() => toggleStudentAccommodation(acc)}
                              style={{ accentColor: "var(--gg-green)" }} />
                            {acc}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => addStudent(cls.id)} disabled={!newStudentName.trim()} style={{
                      padding: "7px 16px", borderRadius: "20px", border: "none",
                      background: newStudentName.trim() ? "var(--gg-green)" : "var(--gg-beige-dark)",
                      color: newStudentName.trim() ? "white" : "var(--gg-brown-mid)",
                      fontWeight: 700, fontSize: "0.8rem", cursor: newStudentName.trim() ? "pointer" : "not-allowed",
                    }}>Add Student</button>
                    <button onClick={() => setShowAddStudent(null)} style={{
                      padding: "7px 16px", borderRadius: "20px", border: "1.5px solid var(--gg-card-border)",
                      background: "var(--gg-white)", color: "var(--gg-brown-mid)",
                      fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddStudent(cls.id)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "20px",
                  border: "1.5px dashed var(--gg-green-light)", background: "var(--gg-green-pale)",
                  color: "var(--gg-green)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                }}>
                  <Plus className="w-3.5 h-3.5" /> Add Student
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
