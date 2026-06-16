"use client";

import GardenIllustration from "@/components/GardenIllustration";

export default function GardenPreviewPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5ead6", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <p style={{ fontFamily: "Nunito, sans-serif", fontSize: 13, color: "#7a5230", marginBottom: 12 }}>
          Preview · <code>GardenIllustration</code> (branch: garden-redesign-preview)
        </p>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #d9c9a8", boxShadow: "3px 6px 0 #e6d8bd" }}>
          <GardenIllustration />
        </div>
      </div>
    </div>
  );
}
