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
    <header style={{
      position: "relative", background: "#f5ead6",
      borderBottom: "1.5px solid var(--gg-card-border)", overflow: "hidden",
    }}>
      {/* Artwork spans the same max-w-6xl width as the app content below it. */}
      <div className="max-w-6xl mx-auto px-4" style={{ position: "relative" }}>
        <GardenIllustration style={{ width: "100%", height: "auto" }} />

        {/* App name + tagline, inside the artwork's top-left corner */}
        <div style={{
          position: "absolute", top: "clamp(12px, 2vw, 24px)", left: "clamp(20px, 3vw, 40px)",
          background: "rgba(255,253,247,0.92)", borderRadius: "14px",
          border: "1.5px solid var(--gg-card-border)", padding: "8px 18px",
          boxShadow: "3px 4px 0px var(--gg-beige-dark)", backdropFilter: "blur(2px)",
          maxWidth: "min(70vw, 380px)",
        }}>
          <h1 style={{ margin: 0, fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)", fontWeight: 800, color: "var(--gg-green)", lineHeight: 1.05, letterSpacing: "-0.5px" }}>
            IEPrep
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "clamp(0.62rem, 1.05vw, 0.74rem)", color: "var(--gg-brown-mid)", fontWeight: 600 }}>
            Individualized Education Meets Intelligent Automation
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
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pt-1 pb-0">
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

      <main className="max-w-6xl mx-auto px-4 py-3">
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
