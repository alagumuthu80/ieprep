"use client";

import { useState, useEffect } from "react";
import { getLessonHistory, deleteLessonFromHistory, formatDate, type SavedLesson } from "@/lib/lessonHistory";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface LessonHistoryProps {
  onLoadLesson: (lesson: SavedLesson) => void;
}

export default function LessonHistory({ onLoadLesson }: LessonHistoryProps) {
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLessons(getLessonHistory());
  }, []);

  if (lessons.length === 0) return null;

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteLessonFromHistory(id);
    setLessons(getLessonHistory());
  }

  return (
    <div className="gg-card" style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--gg-green)",
          color: "white",
          border: "none",
          borderRadius: "8px 8px 0 0",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}
      >
        <span>✨ Recent Lessons ({lessons.length})</span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div style={{ padding: "12px", background: "var(--gg-white)", borderRadius: "0 0 8px 8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {lessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => onLoadLesson(lesson)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  background: "var(--gg-beige-pale)",
                  border: "1px solid var(--gg-card-border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "var(--gg-pink-pale)")}
                onMouseOut={e => (e.currentTarget.style.background = "var(--gg-beige-pale)")}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--gg-green)", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lesson.title || `${lesson.subject} Grade ${lesson.grade}`}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--gg-brown-mid)", marginTop: "2px" }}>
                    {lesson.sols.length} SOL{lesson.sols.length !== 1 ? "s" : ""} · {formatDate(lesson.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, lesson.id)}
                  style={{
                    marginLeft: "8px",
                    padding: "4px 6px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--gg-brown-mid)",
                    transition: "color 0.15s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = "var(--gg-pink)")}
                  onMouseOut={e => (e.currentTarget.style.color = "var(--gg-brown-mid)")}
                  title="Delete"
                  aria-label="Delete lesson"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
