"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  AlertTriangle,
  ArrowRight,
  Compass,
  Footprints,
  HelpCircle,
  Info,
  MapPin,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Train,
} from "lucide-react";
import { getPilotStation } from "@/lib/graph";

type ProblemCategory =
  | "find-platform"
  | "find-exit"
  | "find-lift-escalator"
  | "route-blocked"
  | "wrong-location"
  | "step-free";

type RecoveryGuidance = {
  title: string;
  summary: string;
  steps: string[];
  recommendedAction?: {
    label: string;
    href: string;
  };
};

const recoveryOptions: { id: ProblemCategory; label: string; icon: any; summary: string }[] = [
  {
    id: "find-platform",
    label: "I cannot find my platform",
    icon: Train,
    summary: "Locate Platform 1 (Northbound to PCMC) or Platform 2 (Southbound to Swargate)",
  },
  {
    id: "find-exit",
    label: "I cannot find the exit",
    icon: Compass,
    summary: "Wayfinding to Exit A (Bus Stand), Exit B (Train Station), or Exit C (JM Road)",
  },
  {
    id: "find-lift-escalator",
    label: "I cannot find the lift or escalator",
    icon: Accessibility,
    summary: "Locate central passenger elevator lobby or concourse escalators",
  },
  {
    id: "route-blocked",
    label: "My route is blocked or closed",
    icon: AlertTriangle,
    summary: "Alternate staircase or elevator paths if a gate is cordoned off",
  },
  {
    id: "wrong-location",
    label: "I think I am at the wrong location",
    icon: HelpCircle,
    summary: "Reorient using nearest pillar markings or station QR plaques",
  },
  {
    id: "step-free",
    label: "I need a step-free route",
    icon: Accessibility,
    summary: "100% barrier-free elevator & ramp path without any stair climbing",
  },
];

export default function LostPage() {
  const station = getPilotStation();
  const [selectedProblem, setSelectedProblem] = useState<ProblemCategory>("find-platform");
  const [stepIndex, setStepIndex] = useState(0);

  const getGuidance = (category: ProblemCategory): RecoveryGuidance => {
    switch (category) {
      case "find-platform":
        return {
          title: "Platform Orientation (Pune Central / Civil Court)",
          summary: "Identify which platform serves your travel destination direction:",
          steps: [
            "Check which line direction you are boarding: Towards PCMC (Purple Line Northbound) or Swargate (Purple Line Southbound).",
            "If you are at the Concourse level, Platform 1 (PCMC) is accessed via the North Escalator (Up) or Central Glass Lift.",
            "Platform 2 (Swargate) is accessed via the South Escalator (Down) or Central Glass Lift.",
            "Verify the train destination displayed on the electronic PIDS screen above the platform screen doors before boarding.",
          ],
          recommendedAction: {
            label: "Open Navigation to Platform 1",
            href: "/navigation?dest=platform-1",
          },
        };
      case "find-exit":
        return {
          title: "Station Exit Guidance",
          summary: "Follow verified exit gate designations after tapping out of AFC fare gates:",
          steps: [
            "Exit A: Leads towards MSRTC Central Bus Stand & City Auto Rickshaw stand.",
            "Exit B: Connects directly to the Pune Railway Junction pedestrian footbridge.",
            "Exit C: Connects to Sancheti Chowk, JM Road, and Sancheti Hospital.",
            "If an exit gate is closed for station maintenance, return to the central concourse to use an adjacent exit gate.",
          ],
          recommendedAction: {
            label: "Navigate to Station Exits",
            href: "/navigation?dest=exit-a",
          },
        };
      case "find-lift-escalator":
        return {
          title: "Lift & Escalator Locations",
          summary: "Locate vertical circulation facilities on the concourse level:",
          steps: [
            "The Central Glass Lift is located in the middle of the Concourse level between ticket counter and AFC gates.",
            "The Lift provides step-free direct access to Level 1 platforms.",
            "North Escalator (Up) leads to Platform 1; South Escalator (Down) leads to Platform 2.",
            "If an escalator is halted for servicing, use the adjacent physical staircase or central glass elevator.",
          ],
          recommendedAction: {
            label: "View Accessible Elevator Path",
            href: "/navigation?pref=step-free",
          },
        };
      case "route-blocked":
        return {
          title: "Alternative Path (Route Blocked)",
          summary: "What to do if a staircase, gate, or corridor is cordoned off:",
          steps: [
            "Do not force open or cross any cordoned-off safety barriers or maintenance gates.",
            "If a platform escalator is stopped, use the adjacent staircase Flight A or Flight B.",
            "If a concourse staircase is crowded or closed, walk 15 meters to the Central Glass Lift.",
            "Inform uniformed Pune Metro station personnel stationed near the AFC gates if a route is obstructed unexpectedly.",
          ],
          recommendedAction: {
            label: "Find Alternate Route",
            href: "/navigation",
          },
        };
      case "wrong-location":
        return {
          title: "Reorient Your Station Location",
          summary: "Pinpoint where you are inside the multi-level complex:",
          steps: [
            "Pause and step aside from the main passenger walking stream.",
            "Look for nearest station pillar signage or overhead wayfinding boards.",
            "If you see a wayfinding QR code plaque on a pillar or counter, use 'Scan Station QR' to instantly resolve your location.",
            "If no signs are visible from your location, walk towards the bright central hall (Concourse) where the Station Master and Customer Care counter are located.",
          ],
          recommendedAction: {
            label: "Scan Station QR Code",
            href: "/qr",
          },
        };
      case "step-free":
        return {
          title: "Step-Free Accessible Route",
          summary: "Barrier-free navigation for wheelchairs, strollers, and heavy luggage:",
          steps: [
            "Enter through Gate 2 (South Entrance) using the step-free access ramp on the right.",
            "Cross the level concourse floor directly to the Central Glass Lift.",
            "Take the Lift directly to Platform Level 1 without using stairs or escalators.",
            "If you require wheelchair ramp boarding into the metro train, notify station staff at the Customer Care counter beside the AFC gates.",
          ],
          recommendedAction: {
            label: "Calculate Step-Free Route",
            href: "/navigation?pref=step-free",
          },
        };
    }
  };

  const guidance = getGuidance(selectedProblem);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <p className="eyebrow" style={{ color: "var(--warning-red)" }}>Passenger Station Assistance</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ShieldAlert size={28} color="var(--warning-red)" />
        <span>Lost Passenger Help</span>
      </h1>
      <p className="sub">
        Calm, sequential recovery instructions when disoriented, took a wrong turn, or looking for station facilities in Pune Metro.
      </p>

      {/* Grounding Safety Rule */}
      <div className="notice" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>Official Station Safety:</b> Instructions are grounded in verified layout data for <b>{station.name}</b>. If you feel unwell, disoriented, or require physical assistance, approach uniformed Pune Metro staff or visit the Customer Care counter beside the concourse AFC fare gates.
        </span>
      </div>

      {/* Scenario Selection Cards */}
      <section className="card card-alert-panel">
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Select What You Need Help With:</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {recoveryOptions.map((opt) => {
            const isSelected = selectedProblem === opt.id;
            const Icon = opt.icon;

            return (
              <div
                key={opt.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: isSelected ? "2px solid var(--primary-green)" : "1px solid var(--border)",
                  background: isSelected ? "#F7FAF8" : "#FFFFFF",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedProblem(opt.id);
                  setStepIndex(0);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Icon size={16} color={isSelected ? "var(--deep-green)" : "var(--secondary-text)"} />
                  <b style={{ fontSize: 13, color: isSelected ? "var(--deep-green)" : "var(--primary-text)" }}>
                    {opt.label}
                  </b>
                </div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {opt.summary}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step-by-Step Recovery Action Plan */}
      <section className="card card-transit-panel" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <span className="badge" style={{ background: "#E8F2EC", color: "var(--deep-green)" }}>
              Recovery Plan
            </span>
            <h2 style={{ margin: "6px 0 2px", fontSize: 18 }}>{guidance.title}</h2>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              {guidance.summary}
            </p>
          </div>

          {guidance.recommendedAction && (
            <Link className="button" href={guidance.recommendedAction.href}>
              {guidance.recommendedAction.label} <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {/* Action Steps */}
        <div className="timeline" style={{ marginTop: 16 }}>
          {guidance.steps.map((text, i) => {
            const isCurrent = i === stepIndex;
            const isDone = i < stepIndex;

            return (
              <div
                key={i}
                className={`step-card ${isCurrent ? "active" : ""}`}
                style={{ opacity: isDone ? 0.65 : 1 }}
              >
                <div className="number">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? "var(--deep-green)" : "var(--primary-text)" }}>
                    {isCurrent ? "Action Checklist" : `Step ${i + 1}`}
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--primary-text)" }}>{text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progression Controls */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            className="button"
            onClick={() => setStepIndex((prev) => Math.min(guidance.steps.length - 1, prev + 1))}
            disabled={stepIndex === guidance.steps.length - 1}
          >
            Mark Action Checked & Proceed
          </button>
          <button className="button secondary" onClick={() => setStepIndex(0)}>
            <RotateCcw size={14} /> Restart Actions
          </button>
        </div>
      </section>
    </div>
  );
}
