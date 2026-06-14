"use client";

import { useState } from "react";
import LessonPlanGenerator from "@/components/LessonPlanGenerator";
import GoalTracker from "@/components/GoalTracker";
import ClassManager from "@/components/ClassManager";
import type { SchoolClass } from "@/lib/data";

type Tab = "lessons" | "goals" | "classes";

function GardenHeader() {
  return (
    <header style={{ background: "var(--gg-sky)", overflow: "hidden", position: "relative" }}>
      <svg
        viewBox="0 0 1200 180"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%" }}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <rect width="1200" height="180" fill="#B8D9F0" />

        {/* Large sun */}
        <circle cx="120" cy="38" r="28" fill="#F5C842" opacity="0.95" />
        <circle cx="120" cy="38" r="22" fill="#FBDA5A" />
        {[0,45,90,135,180,225,270,315].map((a,i) => {
          const r = (n: number) => Math.round(n * 1000) / 1000;
          return <line key={i}
            x1={r(120 + 26*Math.cos(a*Math.PI/180))}
            y1={r(38  + 26*Math.sin(a*Math.PI/180))}
            x2={r(120 + 36*Math.cos(a*Math.PI/180))}
            y2={r(38  + 36*Math.sin(a*Math.PI/180))}
            stroke="#F5C842" strokeWidth="3" strokeLinecap="round"
          />;
        })}

        {/* Small sun */}
        <circle cx="980" cy="28" r="16" fill="#F5C842" opacity="0.7" />
        {[0,60,120,180,240,300].map((a,i) => {
          const r = (n: number) => Math.round(n * 1000) / 1000;
          return <line key={i}
            x1={r(980 + 18*Math.cos(a*Math.PI/180))}
            y1={r(28  + 18*Math.sin(a*Math.PI/180))}
            x2={r(980 + 26*Math.cos(a*Math.PI/180))}
            y2={r(28  + 26*Math.sin(a*Math.PI/180))}
            stroke="#F5C842" strokeWidth="2" strokeLinecap="round" opacity="0.7"
          />;
        })}

        {/* Back hills */}
        <ellipse cx="300" cy="200" rx="360" ry="100" fill="#8BB86E" opacity="0.5" />
        <ellipse cx="900" cy="210" rx="400" ry="110" fill="#8BB86E" opacity="0.4" />

        {/* Mid hills */}
        <ellipse cx="200" cy="195" rx="280" ry="80" fill="#6EA64E" opacity="0.7" />
        <ellipse cx="750" cy="200" rx="350" ry="90" fill="#6EA64E" opacity="0.6" />
        <ellipse cx="1100" cy="198" rx="220" ry="75" fill="#6EA64E" opacity="0.65" />

        {/* Ground */}
        <rect x="0" y="148" width="1200" height="32" fill="#4A7A2E" />

        {/* Fence */}
        {Array.from({length: 30}, (_,i) => (
          <g key={i}>
            <rect x={i*40+4} y="138" width="18" height="36" rx="2" fill="#C8A06A" />
            <polygon points={`${i*40+4},138 ${i*40+13},130 ${i*40+22},138`} fill="#D4AE7A" />
          </g>
        ))}
        <rect x="0" y="152" width="1200" height="5" rx="2" fill="#B88A50" opacity="0.7" />
        <rect x="0" y="164" width="1200" height="4" rx="2" fill="#B88A50" opacity="0.5" />

        {/* Tall tree */}
        <rect x="448" y="80" width="10" height="70" rx="3" fill="#8B6040" />
        <ellipse cx="453" cy="80" rx="28" ry="36" fill="#3D6E20" />
        <ellipse cx="453" cy="68" rx="20" ry="26" fill="#4A7A2E" />

        {/* Flowers left */}
        {[{x:180,c:"#E8829A"},{x:220,c:"#D4748A"},{x:260,c:"#F5C4D1"}].map((f,i)=>(
          <g key={i}>
            <line x1={f.x} y1="148" x2={f.x} y2="122" stroke="#4A7A2E" strokeWidth="2.5" />
            <circle cx={f.x} cy="118" r="9" fill={f.c} />
            <circle cx={f.x} cy="118" r="4" fill="#F5C842" />
          </g>
        ))}
        <ellipse cx="195" cy="132" rx="12" ry="6" fill="#5C9E35" transform="rotate(-30 195 132)" />
        <ellipse cx="243" cy="128" rx="11" ry="5" fill="#5C9E35" transform="rotate(25 243 128)" />

        {/* Flowers right */}
        {[{x:680,c:"#D4748A"},{x:720,c:"#E8829A"},{x:760,c:"#F5C4D1"},{x:800,c:"#D4748A"}].map((f,i)=>(
          <g key={i}>
            <line x1={f.x} y1="148" x2={f.x} y2="124" stroke="#4A7A2E" strokeWidth="2.5" />
            <circle cx={f.x} cy="120" r="8" fill={f.c} />
            <circle cx={f.x} cy="120" r="3.5" fill="#F5C842" />
          </g>
        ))}

        {/* Small tree right */}
        <rect x="1040" y="100" width="8" height="50" rx="2" fill="#8B6040" />
        <ellipse cx="1044" cy="98" rx="22" ry="28" fill="#3D6E20" />
        <ellipse cx="1044" cy="88" rx="16" ry="20" fill="#4A7A2E" />

        {/* Welcome sign */}
        <rect x="510" y="138" width="180" height="28" rx="4" fill="#C8A06A" />
        <rect x="513" y="141" width="174" height="22" rx="3" fill="#FFFDF7" />
        <text x="600" y="157" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4A7A2E" fontFamily="Arial, sans-serif">Welcome, Teacher! 🌱</text>

        {/* Month cards */}
        <g transform="rotate(-8 340 105)">
          <rect x="330" y="98" width="56" height="38" rx="5" fill="#FFFDF7" stroke="#D9C9A8" strokeWidth="1" />
          <rect x="330" y="98" width="56" height="12" rx="5" fill="#D4748A" />
          <text x="358" y="108" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">March</text>
          <text x="358" y="124" textAnchor="middle" fontSize="7" fill="#7A5C3A" fontFamily="Arial, sans-serif">Monthly</text>
          <text x="358" y="133" textAnchor="middle" fontSize="7" fill="#7A5C3A" fontFamily="Arial, sans-serif">Plan</text>
        </g>
        <g transform="rotate(6 870 90)">
          <rect x="858" y="84" width="56" height="38" rx="5" fill="#FFFDF7" stroke="#D9C9A8" strokeWidth="1" />
          <rect x="858" y="84" width="56" height="12" rx="5" fill="#4A7A2E" />
          <text x="886" y="94" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="white" fontFamily="Arial, sans-serif">April</text>
          <text x="886" y="110" textAnchor="middle" fontSize="7" fill="#7A5C3A" fontFamily="Arial, sans-serif">Quarterly</text>
          <text x="886" y="119" textAnchor="middle" fontSize="7" fill="#7A5C3A" fontFamily="Arial, sans-serif">Goals</text>
        </g>
      </svg>

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center",
        paddingLeft: "clamp(16px, 4vw, 48px)"
      }}>
        <div style={{
          background: "rgba(255,253,247,0.88)", borderRadius: "14px",
          border: "1.5px solid var(--gg-card-border)", padding: "10px 20px",
          boxShadow: "3px 4px 0px var(--gg-beige-dark)"
        }}>
          <h1 style={{ margin:0, fontSize:"1.6rem", fontWeight:800, color:"var(--gg-green)", lineHeight:1.1, letterSpacing:"-0.5px" }}>
            IEPrep
          </h1>
          <p style={{ margin:0, fontSize:"0.72rem", color:"var(--gg-brown-mid)", fontWeight:500 }}>
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
