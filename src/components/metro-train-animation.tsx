"use client";

import { useEffect, useState } from "react";
import { Train, Info } from "lucide-react";

interface MetroTrainAnimationProps {
  lineColor?: string;
  stationName?: string;
  compact?: boolean;
}

export function MetroTrainAnimation({
  lineColor = "#147D5A",
  stationName = "Civil Court Interchange",
  compact = false,
}: MetroTrainAnimationProps) {
  const [phase, setPhase] = useState<"arriving" | "doors-open" | "departing">("doors-open");

  useEffect(() => {
    // Loop through transit cycle: Arriving -> Doors Open -> Departing
    const interval = setInterval(() => {
      setPhase((prev) => {
        if (prev === "arriving") return "doors-open";
        if (prev === "doors-open") return "departing";
        return "arriving";
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`metro-train-container ${compact ? "compact" : ""}`}
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: compact ? "10px 14px" : "14px 18px",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Stylized metro service illustration"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: lineColor,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--deep-green)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Platform Simulation • {stationName}
          </span>
        </div>

        <span className="badge demo" style={{ fontSize: 10 }}>
          Route Simulation
        </span>
      </div>

      {/* Stylized Railway Track & Train SVG */}
      <div style={{ position: "relative", height: compact ? 42 : 54, display: "flex", alignItems: "center" }}>
        {/* Track Line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 4,
            background: "#DCE3DC",
            borderRadius: 2,
          }}
        >
          {/* Animated sleeper track marks */}
          <div
            className="track-sleepers"
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 18px, #BDC8BD 18px, #BDC8BD 22px)",
            }}
          />
        </div>

        {/* Metro Train Car SVG */}
        <div
          className={`metro-train-car phase-${phase}`}
          style={{
            position: "absolute",
            left: phase === "arriving" ? "10%" : phase === "doors-open" ? "42%" : "85%",
            transition: "left 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width={compact ? "110" : "140"} height={compact ? "32" : "38"} viewBox="0 0 140 38" fill="none">
            {/* Train Body */}
            <rect x="2" y="4" width="136" height="28" rx="6" fill="#202923" />
            <rect x="4" y="6" width="132" height="6" fill={lineColor} />

            {/* Train Front Nose Slope */}
            <path d="M130 10 L138 22 L138 32 L130 32 Z" fill="#334139" />
            <circle cx="134" cy="26" r="2.5" fill="#F2B544" /> {/* Headlight */}

            {/* Windows */}
            <rect x="14" y="14" width="16" height="12" rx="2" fill="#E8F2EC" />
            <rect x="36" y="14" width="16" height="12" rx="2" fill="#E8F2EC" />
            <rect x="58" y="14" width="16" height="12" rx="2" fill="#E8F2EC" />
            <rect x="80" y="14" width="16" height="12" rx="2" fill="#E8F2EC" />
            <rect x="102" y="14" width="16" height="12" rx="2" fill="#E8F2EC" />

            {/* Doors & Opening State */}
            <rect
              x="53"
              y="12"
              width="24"
              height="18"
              fill={phase === "doors-open" ? "#0F172A" : "#334139"}
              stroke="#DCE3DC"
              strokeWidth="0.8"
            />
            {phase === "doors-open" && (
              <>
                {/* Abstract Passenger Silhouette in doorway */}
                <circle cx="65" cy="19" r="2" fill="#94A3B8" />
                <path d="M62 27 C62 23 68 23 68 27" fill="#94A3B8" />
              </>
            )}

            {/* Wheels / Bogie */}
            <circle cx="26" cy="34" r="3" fill="#65716A" />
            <circle cx="44" cy="34" r="3" fill="#65716A" />
            <circle cx="96" cy="34" r="3" fill="#65716A" />
            <circle cx="114" cy="34" r="3" fill="#65716A" />
          </svg>
        </div>

        {/* Platform Station Marker */}
        <div
          style={{
            position: "absolute",
            left: "48%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 80,
            height: 48,
            border: "1px dashed var(--border-strong)",
            borderRadius: 4,
            pointerEvents: "none",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 2,
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: "var(--secondary-text)", background: "#FFFFFF", padding: "0 4px" }}>
            Platform Stop
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <div style={{ fontSize: 11, color: "var(--secondary-text)" }}>
          {phase === "arriving" && "Metro train approaching platform..."}
          {phase === "doors-open" && "Platform doors open • Boarding & alighting"}
          {phase === "departing" && "Doors closed • Departing toward next station"}
        </div>
        <span className="muted" style={{ fontSize: 10 }}>
          Schematic illustration
        </span>
      </div>
    </div>
  );
}
