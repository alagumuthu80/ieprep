"use client";

import { useState } from "react";
import LessonPlanGenerator from "@/components/LessonPlanGenerator";
import GoalTracker from "@/components/GoalTracker";
import ClassManager from "@/components/ClassManager";
import GardenIllustration from "@/components/GardenIllustration";
import type { SchoolClass } from "@/lib/data";

type Tab = "lessons" | "goals" | "classes";

function GardenHeader() {
  return (
    <header style={{ position: "relative", background: "#f5ead6", overflow: "hidden" }}>
      <GardenIllustration />

      {/* App name overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        display: "flex", alignItems: "flex-start",
        padding: "clamp(12px, 2.5vw, 28px)"
      }}>
        <div style={{
          background: "rgba(255,253,247,0.9)", borderRadius: "14px",
          border: "1.5px solid var(--gg-card-border)", padding: "10px 20px",
          boxShadow: "3px 4px 0px var(--gg-beige-dark)"
        }}>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "var(--gg-green)", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            IEPrep
          </h1>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--gg-brown-mid)", fontWeight: 500 }}>
            Differentiated lessons · Special education
          </p>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [loadedClass, setLoadedClass] = useState<SchoolClass | null>(null);

  function handleLoadClass(cls: SchoolClass) {
    // bump a fresh object reference each time so the generator's effect re-fires
    setLoadedClass({ ...cls });
    setActiveTab("lessons");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--gg-beige)" }}>
      <GardenHeader />

      <div style={{ background: "var(--gg-white)", borderBottom: "1.5px solid var(--gg-card-border)" }}>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pt-2">
          {([
            { id: "lessons", label: "📖 Lesson Generator" },
            { id: "goals",   label: "🎯 Goal Tracker" },
            { id: "classes", label: "🏫 My Classes" },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px", borderRadius: "10px 10px 0 0",
                border: activeTab === tab.id ? "1.5px solid var(--gg-card-border)" : "1.5px solid transparent",
                borderBottom: activeTab === tab.id ? "1.5px solid var(--gg-white)" : "1.5px solid transparent",
                background: activeTab === tab.id ? "var(--gg-white)" : "transparent",
                color: activeTab === tab.id ? "var(--gg-green)" : "var(--gg-brown-mid)",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s",
                marginBottom: "-1.5px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Kept mounted so generated lesson plans persist across tab switches */}
        <div style={{ display: activeTab === "lessons" ? "block" : "none" }}>
          <LessonPlanGenerator loadedClass={loadedClass} onClearClass={() => setLoadedClass(null)} />
        </div>
        <div style={{ display: activeTab === "goals" ? "block" : "none" }}>
          <GoalTracker />
        </div>
        <div style={{ display: activeTab === "classes" ? "block" : "none" }}>
          <ClassManager onLoadClass={handleLoadClass} />
        </div>
      </main>
    </div>
  );
}
