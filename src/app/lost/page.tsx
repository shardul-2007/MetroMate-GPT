"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  AlertTriangle,
  ArrowRight,
  Compass,
  HelpCircle,
  Info,
  MapPin,
  RotateCcw,
  ShieldAlert,
  Siren,
  Train,
} from "lucide-react";
import { getPilotStation } from "@/lib/graph";

type ProblemCategory =
  | "unknown-location"
  | "find-platform"
  | "find-exit"
  | "step-free"
  | "route-blocked"
  | "wrong-direction";

type RecoveryGuidance = {
  title: string;
  steps: string[];
  recommendedAction?: {
    label: string;
    href: string;
  };
};

const recoveryOptions: { id: ProblemCategory; label: string; icon: any; summary: string }[] = [
  {
    id: "unknown-location",
    label: "I don't know where I am",
    icon: HelpCircle,
    summary: "Reorient by identifying the nearest landmark or pillar code",
  },
  {
    id: "find-platform",
    label: "I cannot find my platform",
    icon: Train,
    summary: "Locate Platform 1 (Northbound) or Platform 2 (Southbound)",
  },
  {
    id: "find-exit",
    label: "I cannot find the station exit",
    icon: Compass,
    summary: "Guidance to Exit A (Bus Stand), Exit B (Train Station), or Exit C",
  },
  {
    id: "step-free",
    label: "I need a step-free route",
    icon: Accessibility,
    summary: "Find the central glass lift and ramp access without stairs",
  },
  {
    id: "route-blocked",
    label: "My selected route is blocked",
    icon: AlertTriangle,
    summary: "Alternate staircase or elevator paths if maintenance is occurring",
  },
  {
    id: "wrong-direction",
    label: "I took the wrong direction",
    icon: RotateCcw,
    summary: "Safely cross over to the opposite platform without leaving fare zone",
  },
];

export default function LostPage() {
  const station = getPilotStation();
  const [selectedProblem, setSelectedProblem] = useState<ProblemCategory>("unknown-location");
  const [stationLandmark, setStationLandmark] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const getGuidance = (category: ProblemCategory): RecoveryGuidance => {
    switch (category) {
      case "unknown-location":
        return {
          title: "Reorient Your Station Location",
          steps: [
            "Stop walking and move to the side of the corridor or walkway out of passenger flow.",
            "Look for the nearest station pillar, overhead sign, or wall sign. Check whether it says 'Concourse', 'Platform 1', 'Platform 2', or an Exit letter.",
            "If you see a QR plaque on a pillar or counter, use MetroMate's 'Scan Station QR' to pinpoint your exact coordinates.",
            "If no signs are legible from your spot, walk towards the bright central hall (Concourse) where the customer care booth is located.",
          ],
          recommendedAction: {
            label: "Open Station Navigator",
            href: "/navigation",
          },
        };
      case "find-platform":
        return {
          title: "Platform Orientation (Pune Central)",
          steps: [
            "Check which train direction you need: Towards PCMC (Northbound) or Swargate (Southbound).",
            "From the Concourse, Platform 1 (PCMC) is served by the North Escalator (Up) or Central Glass Lift.",
            "Platform 2 (Swargate) is served by the South Escalator (Down) or Central Glass Lift.",
            "Verify the train destination on the overhead electronic arrival screen above the platform screen doors before boarding.",
          ],
          recommendedAction: {
            label: "Navigate to Platform 1",
            href: "/navigation?dest=platform-1",
          },
        };
      case "find-exit":
        return {
          title: "Station Exit Guidance",
          steps: [
            "Make sure you have tapped out through the active green AFC fare gates on the Concourse level.",
            "For MSRTC Central Bus Stand & City Auto Stand: Follow overhead signs for Exit A.",
            "For Pune Railway Junction connection: Follow signs for Exit B to the footbridge.",
            "For Sancheti Hospital & JM Road: Follow signs for Exit C.",
            "If an exit gate is locked for maintenance, follow signs back to the central concourse to choose an alternate gate.",
          ],
          recommendedAction: {
            label: "Navigate to Exits",
            href: "/navigation?dest=exit-a",
          },
        };
      case "step-free":
        return {
          title: "Step-Free Accessible Route",
          steps: [
            "Locate the Central Glass Lift on the concourse level — it provides 100% step-free access to all platform levels.",
            "If you entered from Gate 2, follow the designated wheelchair ramp on the right side rather than the entrance stairs.",
            "Do not attempt to use escalators or stairs with wheelchairs, heavy luggage, or strollers.",
            "If the lift is occupied or undergoing maintenance, ask station staff at the Customer Care desk next to the AFC gates for assistance.",
          ],
          recommendedAction: {
            label: "Calculate Step-Free Route",
            href: "/navigation?pref=step-free",
          },
        };
      case "route-blocked":
        return {
          title: "Alternative Path (Route Blocked)",
          steps: [
            "Do not force open any cordoned-off or locked gates.",
            "If an escalator is stopped, use the adjacent physical staircase or locate the Central Glass Lift.",
            "If a platform stair flight is crowded or closed, access the platform via the opposite end escalator or elevator.",
            "Report unexpected blockages to uniformed Pune Metro security personnel stationed near the gates.",
          ],
          recommendedAction: {
            label: "Find Alternate Route",
            href: "/navigation",
          },
        };
      case "wrong-direction":
        return {
          title: "Correcting Directional Mistake",
          steps: [
            "Do not tap out of the exit gates if you only boarded the wrong platform — staying inside the paid area avoids a double fare.",
            "Look for the central stairs or glass lift on your current platform.",
            "Take the lift or stairs back up/down to the Concourse transfer corridor.",
            "Cross over to the opposite platform (Platform 1 for Northbound, Platform 2 for Southbound) using the central concourse walkway.",
          ],
          recommendedAction: {
            label: "Open Navigation to Correct Platform",
            href: "/navigation?start=platform-2&dest=platform-1",
          },
        };
    }
  };

  const guidance = getGuidance(selectedProblem);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <p className="eyebrow">Emergency & Orientation Support</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ShieldAlert size={32} color="#7956e9" />
        Lost Passenger Rescue
      </h1>
      <p className="sub">
        Calibrated recovery instructions for passengers who feel lost, took a wrong turn, or cannot find accessible facilities inside Pune Metro stations.
      </p>

      {/* Grounded Pilot Station Disclaimer */}
      <div className="notice" style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#755812" style={{ flexShrink: 0 }} />
        <span>
          <b>Station Safety Rule:</b> MetroMate provides grounded instructions from the verified layout of <b>{station.name}</b>. If you feel unsafe or need physical assistance, always approach uniformed station personnel or customer care counters.
        </span>
      </div>

      {/* Scenario Selector */}
      <section className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>What is the situation?</h2>
        <div className="grid">
          {recoveryOptions.map((opt) => {
            const isSelected = selectedProblem === opt.id;
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                className={`card ${isSelected ? "card-hero" : ""}`}
                style={{
                  cursor: "pointer",
                  border: isSelected ? "2px solid #7956e9" : "1px solid #e2e8f0",
                  padding: 16,
                }}
                onClick={() => {
                  setSelectedProblem(opt.id);
                  setStepIndex(0);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Icon size={18} color={isSelected ? "#7956e9" : "#64748b"} />
                  <b style={{ fontSize: 14 }}>{opt.label}</b>
                </div>
                <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                  {opt.summary}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guided Steps Section */}
      <section className="card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <span className="badge demo">Recovery Plan</span>
            <h2 style={{ margin: "6px 0 2px" }}>{guidance.title}</h2>
          </div>
          {guidance.recommendedAction && (
            <Link className="button" href={guidance.recommendedAction.href}>
              {guidance.recommendedAction.label} <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* Sequential Step Progression */}
        <div className="timeline" style={{ marginTop: 20 }}>
          {guidance.steps.map((text, i) => {
            const isCurrent = i === stepIndex;
            const isDone = i < stepIndex;

            return (
              <div
                key={i}
                className={`step-card ${isCurrent ? "active" : ""}`}
                style={{ opacity: isDone ? 0.7 : 1 }}
              >
                <div className="number">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 14, color: isCurrent ? "#6950d5" : "#1e293b" }}>
                    {isCurrent ? "Current Recommended Action" : `Step ${i + 1}`}
                  </b>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "#334155" }}>{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Progression Controls */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            className="button"
            onClick={() => setStepIndex((prev) => Math.min(guidance.steps.length - 1, prev + 1))}
            disabled={stepIndex === guidance.steps.length - 1}
          >
            Mark Action Completed & Proceed
          </button>
          <button className="button secondary" onClick={() => setStepIndex(0)}>
            <RotateCcw size={15} /> Restart Guidance
          </button>
        </div>
      </section>
    </div>
  );
}
