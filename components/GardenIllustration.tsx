"use client";

import React from "react";

/* ──────────────────────────────────────────────────────────────────────────
   GardenIllustration — paper-cut craft scene as an inline SVG.
   Self-contained: no external images, no props required.
   viewBox 0 0 960 340.
─────────────────────────────────────────────────────────────────────────── */

const SHADOW = "url(#gg-shadow)";

// ── Sun with petal-shaped rays + sleepy face ───────────────────────────────
function Sun({
  cx, cy, bodyR, nPetals, petalFill, bodyFill, petalRx, petalRy,
}: {
  cx: number; cy: number; bodyR: number; nPetals: number;
  petalFill: string; bodyFill: string; petalRx: number; petalRy: number;
}) {
  const dist = bodyR + petalRy * 0.55;
  const petals = Array.from({ length: nPetals }, (_, i) => {
    const angle = (360 / nPetals) * i;
    return (
      <g key={i} transform={`rotate(${angle} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy - dist} rx={petalRx} ry={petalRy} fill={petalFill} />
      </g>
    );
  });
  const eyeY = cy - bodyR * 0.08;
  const eyeDx = bodyR * 0.34;
  const eyeW = bodyR * 0.2;
  return (
    <g filter={SHADOW}>
      {petals}
      <circle cx={cx} cy={cy} r={bodyR} fill={bodyFill} />
      {/* closed crescent eyes (peak up, opening downward) */}
      <path d={`M ${cx - eyeDx - eyeW} ${eyeY} Q ${cx - eyeDx} ${eyeY - eyeW} ${cx - eyeDx + eyeW} ${eyeY}`}
        stroke="#5d3a1a" strokeWidth={bodyR * 0.06} fill="none" strokeLinecap="round" />
      <path d={`M ${cx + eyeDx - eyeW} ${eyeY} Q ${cx + eyeDx} ${eyeY - eyeW} ${cx + eyeDx + eyeW} ${eyeY}`}
        stroke="#5d3a1a" strokeWidth={bodyR * 0.06} fill="none" strokeLinecap="round" />
      {/* blushed cheeks */}
      <ellipse cx={cx - bodyR * 0.5} cy={cy + bodyR * 0.22} rx={bodyR * 0.16} ry={bodyR * 0.1} fill="#ffb3a7" opacity={0.55} />
      <ellipse cx={cx + bodyR * 0.5} cy={cy + bodyR * 0.22} rx={bodyR * 0.16} ry={bodyR * 0.1} fill="#ffb3a7" opacity={0.55} />
      {/* smile */}
      <path d={`M ${cx - bodyR * 0.32} ${cy + bodyR * 0.34} Q ${cx} ${cy + bodyR * 0.62} ${cx + bodyR * 0.32} ${cy + bodyR * 0.34}`}
        stroke="#5d3a1a" strokeWidth={bodyR * 0.06} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ── A ring of petals around a flower center ────────────────────────────────
function petalRing(cx: number, cy: number, n: number, radius: number, rx: number, ry: number, fill: string, offset = 0) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (360 / n) * i + offset;
    return (
      <g key={`${fill}-${i}`} transform={`rotate(${angle} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy - radius} rx={rx} ry={ry} fill={fill} />
      </g>
    );
  });
}

// ── A swaying flower ───────────────────────────────────────────────────────
function Flower({
  x, top, bottom, rings, centerOuter, centerInner, swayDelay,
}: {
  x: number; top: number; bottom: number;
  rings: { n: number; radius: number; rx: number; ry: number; fill: string; offset?: number }[];
  centerOuter: { r: number; fill: string };
  centerInner: { r: number; fill: string };
  swayDelay: number;
}) {
  return (
    <g filter={SHADOW} style={{ transformOrigin: `${x}px ${bottom}px`, animation: `gg-sway ${4 + (swayDelay % 2)}s ease-in-out ${swayDelay}s infinite` }}>
      {/* stem */}
      <rect x={x - 3.5} y={top} width={7} height={bottom - top} rx={3.5} fill="#558b2f" />
      {/* leaves */}
      <ellipse cx={x - 14} cy={top + (bottom - top) * 0.42} rx={15} ry={7} fill="#66bb6a" transform={`rotate(-32 ${x - 14} ${top + (bottom - top) * 0.42})`} />
      <ellipse cx={x + 14} cy={top + (bottom - top) * 0.58} rx={14} ry={6.5} fill="#66bb6a" transform={`rotate(34 ${x + 14} ${top + (bottom - top) * 0.58})`} />
      {/* petals */}
      {rings.flatMap((r) => petalRing(x, top, r.n, r.radius, r.rx, r.ry, r.fill, r.offset ?? 0))}
      {/* center */}
      <circle cx={x} cy={top} r={centerOuter.r} fill={centerOuter.fill} />
      <circle cx={x} cy={top} r={centerInner.r} fill={centerInner.fill} />
    </g>
  );
}

// ── Calendar card ──────────────────────────────────────────────────────────
function CalendarCard({
  x, y, rotate, header, headerFill, label, bannerFill, bannerText, cellHi, floatDelay,
}: {
  x: number; y: number; rotate: number; header: string; headerFill: string;
  label: string; bannerFill: string; bannerText: string; cellHi: string; floatDelay: number;
}) {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const hi = r === 1 && c === 3;
      cells.push(
        <rect key={`${r}-${c}`} x={x + 8 + c * 12.6} y={y + 30 + r * 11} width={10} height={8} rx={1.5}
          fill={hi ? cellHi : "rgba(0,0,0,0.05)"} />
      );
    }
  }
  return (
    <g filter={SHADOW} style={{ transformOrigin: `${x + 51}px ${y + 40}px`, animation: `gg-float 5.5s ease-in-out ${floatDelay}s infinite` }}
      transform={`rotate(${rotate} ${x + 51} ${y + 40})`}>
      <rect x={x} y={y} width={102} height={78} rx={8} fill="#fff8f0" />
      <rect x={x} y={y} width={102} height={22} rx={8} fill={headerFill} />
      <rect x={x} y={y + 14} width={102} height={8} fill={headerFill} />
      <text x={x + 51} y={y + 15} textAnchor="middle" fill="#fff" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={12}>{header}</text>
      {cells}
      <rect x={x + 6} y={y + 84} width={90} height={18} rx={4} fill={bannerFill} />
      <text x={x + 51} y={y + 96} textAnchor="middle" fill={label} fontFamily="Nunito, sans-serif" fontWeight={700} fontSize={9}>{bannerText}</text>
    </g>
  );
}

export default function GardenIllustration({ className }: { className?: string }) {
  // Fence post positions
  const posts = Array.from({ length: 14 }, (_, i) => 18 + i * 70);

  return (
    <svg viewBox="0 0 960 340" xmlns="http://www.w3.org/2000/svg" className={className}
      style={{ display: "block", width: "100%", height: "auto" }} role="img"
      aria-label="Paper-cut garden scene with suns, hills, flowers, a tree, a fence and a welcome sign">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap');
        @keyframes gg-sway  { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes gg-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-9px); } }
      `}</style>

      <defs>
        <filter id="gg-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(90,60,20,0.22)" />
        </filter>
        <filter id="gg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves={4} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <linearGradient id="gg-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a96a" />
          <stop offset="100%" stopColor="#a87840" />
        </linearGradient>
        <linearGradient id="gg-sign" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8cfa0" />
          <stop offset="100%" stopColor="#d4b07a" />
        </linearGradient>
      </defs>

      {/* Layer 0 — beige paper base */}
      <rect width="960" height="340" fill="#f5ead6" />

      {/* Layer 1 — sky arch */}
      <g filter={SHADOW}>
        <path d="M0 0 L960 0 L960 180 Q850 120 720 148 Q600 170 480 155 Q360 140 240 162 Q120 178 0 155 Z" fill="#c8e8f4" />
      </g>
      {/* clouds */}
      {[{ x: 200, y: 52 }, { x: 560, y: 35 }].map((c, i) => (
        <g key={i} filter={SHADOW}>
          <ellipse cx={c.x} cy={c.y} rx={26} ry={16} fill="#ffffff" />
          <ellipse cx={c.x + 22} cy={c.y + 4} rx={20} ry={13} fill="#ffffff" />
          <ellipse cx={c.x - 20} cy={c.y + 5} rx={17} ry={11} fill="#ffffff" />
        </g>
      ))}

      {/* Suns — upper RIGHT */}
      <Sun cx={798} cy={82} bodyR={52} nPetals={12} petalFill="#ffe57f" bodyFill="#fdd835" petalRx={14} petalRy={19} />
      <Sun cx={700} cy={148} bodyR={28} nPetals={10} petalFill="#ffe082" bodyFill="#ffca28" petalRx={9} petalRy={12} />

      {/* Hills */}
      <g filter={SHADOW}>
        <path d="M0 200 Q120 145 240 162 Q380 178 480 155 Q580 135 680 158 Q800 178 960 148 L960 340 L0 340 Z" fill="#b8ddb5" />
      </g>
      <g filter={SHADOW}>
        <path d="M0 240 Q80 205 180 215 Q280 225 360 208 Q460 190 560 210 Q660 228 760 210 Q860 195 960 215 L960 340 L0 340 Z" fill="#88c080" />
      </g>
      <g filter={SHADOW}>
        <path d="M0 268 Q100 248 200 255 Q320 262 420 248 Q520 235 620 252 Q720 268 820 252 Q900 240 960 250 L960 340 L0 340 Z" fill="#5aaa60" />
      </g>
      <rect x="0" y="295" width="960" height="45" fill="#4a9e50" />

      {/* Tree */}
      <g filter={SHADOW}>
        <rect x={845} y={185} width={22} height={120} rx={5} fill="#8d6030" />
        <circle cx={856} cy={236} r={52} fill="#2e7d32" />
        <circle cx={856} cy={220} r={48} fill="#388e3c" />
        <circle cx={856} cy={205} r={40} fill="#43a047" />
        <circle cx={856} cy={200} r={36} fill="#4caf50" />
        <circle cx={856} cy={190} r={28} fill="#66bb6a" />
        <circle cx={856} cy={184} r={18} fill="#81c784" />
      </g>

      {/* Flowers */}
      <Flower x={268} top={218} bottom={305} swayDelay={0}
        rings={[{ n: 7, radius: 19, rx: 12, ry: 7, fill: "#9c27b0" }]}
        centerOuter={{ r: 9, fill: "#fdd835" }} centerInner={{ r: 5, fill: "#f57f17" }} />
      <Flower x={320} top={232} bottom={305} swayDelay={1.1}
        rings={[{ n: 6, radius: 15, rx: 10, ry: 6, fill: "#7b1fa2" }]}
        centerOuter={{ r: 7, fill: "#fdd835" }} centerInner={{ r: 4, fill: "#f57f17" }} />
      <Flower x={435} top={220} bottom={305} swayDelay={0.5}
        rings={[
          { n: 8, radius: 21, rx: 11, ry: 6.5, fill: "#f48fb1" },
          { n: 8, radius: 12, rx: 8, ry: 4.5, fill: "#e91e63", offset: 22 },
        ]}
        centerOuter={{ r: 8, fill: "#fdd835" }} centerInner={{ r: 4.5, fill: "#f57f17" }} />
      <Flower x={545} top={216} bottom={305} swayDelay={1.6}
        rings={[
          { n: 9, radius: 22, rx: 13, ry: 7, fill: "#ff8f00" },
          { n: 9, radius: 13, rx: 8, ry: 5, fill: "#fdd835", offset: 20 },
        ]}
        centerOuter={{ r: 9, fill: "#ff6f00" }} centerInner={{ r: 5, fill: "#bf360c" }} />
      <Flower x={638} top={224} bottom={305} swayDelay={0.8}
        rings={[{ n: 7, radius: 18, rx: 11, ry: 6.5, fill: "#ffd835" }]}
        centerOuter={{ r: 8, fill: "#ff8f00" }} centerInner={{ r: 4.5, fill: "#e65100" }} />

      {/* Fence */}
      <g filter={SHADOW}>
        {posts.map((px, i) => (
          <g key={i}>
            <rect x={px} y={269} width={18} height={58} rx={4} fill="url(#gg-wood)" />
            <rect x={px} y={266} width={18} height={8} rx={3} fill="#d4a96a" />
            <line x1={px + 6} y1={274} x2={px + 6} y2={322} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
            <line x1={px + 12} y1={274} x2={px + 12} y2={322} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
          </g>
        ))}
        {[296, 310, 323].map((sy, i) => (
          <g key={i}>
            <rect x={10} y={sy} width={940} height={10} rx={3} fill="url(#gg-wood)" />
            <rect x={10} y={sy} width={940} height={3} rx={3} fill="rgba(255,255,255,0.18)" />
            <rect x={10} y={sy + 8} width={940} height={2} fill="rgba(0,0,0,0.10)" />
          </g>
        ))}
      </g>

      {/* Welcome sign */}
      <g filter={SHADOW}>
        <rect x={415} y={255} width={12} height={72} fill="#b8863a" />
        <rect x={533} y={255} width={12} height={72} fill="#b8863a" />
        <path d="M392 230 Q403 222 421 240" stroke="#a07840" strokeWidth={2.5} fill="none" />
        <path d="M568 230 Q557 222 539 240" stroke="#a07840" strokeWidth={2.5} fill="none" />
        <rect x={388} y={226} width={184} height={58} rx={8} fill="url(#gg-sign)" />
        <rect x={394} y={232} width={172} height={46} rx={6} fill="none" stroke="rgba(120,80,30,0.25)" strokeWidth={1.5} />
        {[238, 250, 262, 274].map((ly, i) => (
          <line key={i} x1={400} y1={ly} x2={560} y2={ly} stroke="rgba(120,80,30,0.08)" strokeWidth={1} />
        ))}
        {[[396, 234], [564, 234], [396, 276], [564, 276]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={4} fill="#a07840" />
        ))}
        <text x={480} y={251} textAnchor="middle" fill="#5d3a1a" fontFamily="Nunito, sans-serif" fontWeight={700} fontSize={13}>Welcome,</text>
        <text x={480} y={269} textAnchor="middle" fill="#3e7a3e" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={15}>Teacher!</text>
      </g>

      {/* Calendar cards */}
      <CalendarCard x={111} y={204} rotate={-8} header="March" headerFill="#ff8a65"
        label="#7a5230" bannerFill="#f5deb3" bannerText="Monthly Plan" cellHi="#ff8a65" floatDelay={0} />
      <CalendarCard x={854} y={195} rotate={7} header="April" headerFill="#66bb6a"
        label="#2e7d32" bannerFill="#c8e6c9" bannerText="Quarterly Goals" cellHi="#43a047" floatDelay={1.5} />

      {/* Final overlay — paper grain + vignette */}
      <rect width="960" height="340" filter="url(#gg-grain)" opacity={0.2} style={{ mixBlendMode: "multiply" }} pointerEvents="none" />
      <rect x="0" y="0" width="960" height="340" fill="none" stroke="rgba(120,80,30,0.08)" strokeWidth={30} />
    </svg>
  );
}
