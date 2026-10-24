import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Bot,
  Compass,
  Footprints,
  Layers,
  MapPin,
  QrCode,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { demoRoutes, money } from "@/lib/data";
import { getPilotStation } from "@/lib/graph";

export default function Home() {
  const station = getPilotStation();

  return (
    <>
      {/* Top Banner / Product Identity */}
      <p className="eyebrow">Indoor Wayfinding & Navigation</p>
      <h1 className="title">MetroMate GPT</h1>
      <p className="sub">
        Beyond the metro map. Step-by-step indoor station navigation, platform finder, accessibility-first routing, and safe passenger recovery for Pune Metro.
      </p>

      {/* Hero Station Navigation Card - Priority 1 Action */}
      <section className="card card-hero" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge demo">Pilot Pilot Station</span>
            <span className="badge" style={{ background: "#e0e7ff", color: "#3730a3" }}>
              {station.name}
            </span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {station.line}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
            <Compass size={26} color="#6950d5" />
            Where are you inside the station?
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Choose your starting point and destination to generate turn-by-turn walking steps, stair alerts, and elevator paths.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link
            className="button"
            href="/navigation"
            style={{ fontSize: 15, padding: "12px 20px" }}
          >
            Start Inside-Station Navigation <ArrowRight size={17} />
          </Link>

          <Link
            className="button secondary"
            href="/navigation?dest=platform-1"
            style={{ fontSize: 14 }}
          >
            Find My Platform (PCMC)
          </Link>

          <Link
            className="button secondary"
            href="/navigation?dest=platform-2"
            style={{ fontSize: 14 }}
          >
            Find Platform 2 (Swargate)
          </Link>

          <Link
            className="button outline"
            href="/navigation?pref=step-free"
            style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Accessibility size={16} color="#0369a1" /> Step-Free Elevator Route
          </Link>
        </div>

        {/* Quick QR entry bar */}
        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: 10,
            border: "1px dashed #cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <QrCode size={20} color="#6950d5" />
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                Near a Station Pillar or Counter?
              </span>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                Scan or enter the location code on the indoor wayfinding plaque.
              </p>
            </div>
          </div>

          <Link
            href="/navigation?qr=%7B%22system%22%3A%22pune-metro%22%2C%22stationId%22%3A%22pune-central%22%2C%22nodeId%22%3A%22entrance-north%22%7D"
            className="button secondary"
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            Try Demo Station QR
          </Link>
        </div>
      </section>

      {/* Two Column Feature Section */}
      <div className="two" style={{ marginTop: 20 }}>
        {/* Left: Station Wayfinding Highlights */}
        <section className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <MapPin size={20} color="#6950d5" />
            <h2 style={{ margin: 0, fontSize: 18 }}>Pilot Station Wayfinding Points</h2>
          </div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Grounded node points in <b>Pune Central (Civil Court)</b>:
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <div className="route">
              <b>Platform 1 & 2 Boarding</b>
              <br />
              <span className="muted" style={{ fontSize: 13 }}>
                Escalators, flight stairs, and Central Glass Lift to Level 1.
              </span>
            </div>

            <div className="route">
              <b>Gate 1 (North) & Gate 2 (South)</b>
              <br />
              <span className="muted" style={{ fontSize: 13 }}>
                Step-free ramp at Gate 2; security baggage scan at concourse entrance.
              </span>
            </div>

            <div className="route">
              <b>Verified Station Exits (A, B, C)</b>
              <br />
              <span className="muted" style={{ fontSize: 13 }}>
                Exit A (MSRTC Bus Stand), Exit B (Pune Junction Footbridge), Exit C (Sancheti Hospital).
              </span>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Link className="button outline" href="/navigation" style={{ width: "100%", justifyContent: "center" }}>
              Explore Interactive Station Map
            </Link>
          </div>
        </section>

        {/* Right: Lost Passenger Rescue & AI Companion */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Lost Passenger Rescue */}
          <section className="card" style={{ borderLeft: "4px solid #7956e9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <ShieldAlert size={20} color="#7956e9" />
              <h2 style={{ margin: 0, fontSize: 18 }}>Lost Passenger Rescue</h2>
            </div>
            <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
              Disoriented or took the wrong staircase? Get instant recovery steps based on station landmarks.
            </p>
            <Link className="button secondary" href="/lost" style={{ width: "100%", justifyContent: "center" }}>
              I'm Lost — Get Help Now
            </Link>
          </section>

          {/* AI Navigation Companion */}
          <section className="card" style={{ borderLeft: "4px solid #0e8760" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Bot size={20} color="#0e8760" />
              <h2 style={{ margin: 0, fontSize: 18 }}>MetroMate AI Companion</h2>
            </div>
            <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
              Ask questions about lifts, platforms, or exit choices without hallucinated facts.
            </p>
            <Link className="button secondary" href="/assistant" style={{ width: "100%", justifyContent: "center" }}>
              Ask MetroMate AI
            </Link>
          </section>
        </div>
      </div>

      {/* Secondary Tools Header */}
      <div style={{ marginTop: 36, marginBottom: 12 }}>
        <span className="eyebrow" style={{ color: "#64748b" }}>
          Secondary Utilities
        </span>
        <h3 style={{ fontSize: 18, margin: "4px 0" }}>Door-to-Door Journey & Commuter Spend</h3>
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          Optional commute cost tracking and multi-modal transit comparison.
        </p>
      </div>

      {/* Secondary Cards Grid */}
      <div className="grid">
        <section className="card">
          <span className="badge demo">Demo Route</span>
          <p className="muted" style={{ marginTop: 8 }}>Lowest-Cost Door-to-Door</p>
          <p className="stat">{money(42)}</p>
          <p className="muted">Metro + walk • 48 min</p>
          <Link href="/planner" style={{ fontSize: 13, color: "#6950d5", fontWeight: 700 }}>
            Compare multimodal transit →
          </Link>
        </section>

        <section className="card">
          <span className="badge">Local Storage</span>
          <p className="muted" style={{ marginTop: 8 }}>Recorded Commute Spend</p>
          <p className="stat">{money(0)}</p>
          <p className="muted">Track your daily metro & bus expenses</p>
          <Link href="/expenses" style={{ fontSize: 13, color: "#6950d5", fontWeight: 700 }}>
            Manage expenses →
          </Link>
        </section>

        <section className="card">
          <span className="badge demo">Estimated Demo</span>
          <p className="muted" style={{ marginTop: 8 }}>Potential Monthly Saving</p>
          <p className="stat mint">{money(54)}</p>
          <p className="muted">Metro commute vs cab/auto</p>
          <Link href="/analytics" style={{ fontSize: 13, color: "#07875e", fontWeight: 700 }}>
            View spend analytics →
          </Link>
        </section>
      </div>
    </>
  );
}
