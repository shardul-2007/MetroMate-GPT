"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  ArrowDownUp,
  ArrowRight,
  Compass,
  Footprints,
  HelpCircle,
  Info,
  MapPin,
  QrCode,
  Route,
  ShieldAlert,
  Train,
  Zap,
} from "lucide-react";
import { getPilotStation } from "@/lib/graph";
import { MetroTrainAnimation } from "@/components/metro-train-animation";
import { MaharashtraMetroMap } from "@/components/maharashtra-metro-map";
import { StationSatellitePreview } from "@/components/station-satellite-preview";

export default function Home() {
  const router = useRouter();
  const station = getPilotStation();

  // Transit quick route form states
  const [startId, setStartId] = useState<string>("entrance-north");
  const [destId, setDestId] = useState<string>("platform-1");
  const [pref, setPref] = useState<string>("fastest");
  const [stepFreeOnly, setStepFreeOnly] = useState<boolean>(false);

  const selectedDestNode = station.nodes.find((n) => n.id === destId);
  const selectedStartNode = station.nodes.find((n) => n.id === startId);

  const handleSwap = () => {
    const temp = startId;
    setStartId(destId);
    setDestId(temp);
  };

  const handleFindRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePref = stepFreeOnly ? "step-free" : pref;
    router.push(`/navigation?start=${startId}&dest=${destId}&pref=${effectivePref}`);
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      {/* Station Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <p className="eyebrow">Passenger Information System</p>
          <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Pune Metro Navigator</span>
          </h1>
          <p className="sub" style={{ margin: 0 }}>
            Station wayfinding, platform routing, and step-by-step pedestrian navigation for Pune Metro Hubs.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge verified">
            ● Normal Service
          </span>
          <span className="badge demo">
            Pilot: Civil Court
          </span>
        </div>
      </div>

      {/* Stylized Metro Train Arrival & Departure Component */}
      <div style={{ marginBottom: 18 }} className="animate-fade-in-up">
        <MetroTrainAnimation
          lineColor="#6B21A8"
          stationName="Civil Court Interchange • Line 1 & Line 2"
        />
      </div>

      {/* Main Journey Planner Card (Transit Style) */}
      <section className="card card-transit-panel animate-fade-in-up" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Train size={20} color="var(--primary-green)" />
            <h2 style={{ margin: 0, fontSize: 18 }}>Plan Station Route</h2>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            Selected Station: <b>Pune Central (Civil Court Interchange)</b>
          </span>
        </div>

        <form onSubmit={handleFindRoute} className="form">
          <div className="row" style={{ alignItems: "center" }}>
            <div className="field">
              <label htmlFor="start-location" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={15} color="#059669" />
                <span>From (Your Location in Station)</span>
              </label>
              <select
                id="start-location"
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
              >
                <optgroup label="Entrances & Street Gates">
                  {station.nodes
                    .filter((n) => n.type === "entrance")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Ticketing & Concourse">
                  {station.nodes
                    .filter((n) => ["ticket", "concourse", "lift"].includes(n.type))
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Platforms">
                  {station.nodes
                    .filter((n) => n.type === "platform")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Exits">
                  {station.nodes
                    .filter((n) => n.type === "exit")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="dest-location" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={15} color="#147D5A" />
                  <span>To (Destination in Station)</span>
                </label>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="button outline"
                  style={{ padding: "2px 8px", fontSize: 11, height: 24, gap: 4 }}
                  title="Swap start and destination"
                >
                  <ArrowDownUp size={12} /> Swap
                </button>
              </div>
              <select
                id="dest-location"
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
              >
                <optgroup label="Platforms (Board Train)">
                  {station.nodes
                    .filter((n) => n.type === "platform")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Exits (Leave Station)">
                  {station.nodes
                    .filter((n) => n.type === "exit")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Ticketing & Concourse">
                  {station.nodes
                    .filter((n) => ["ticket", "concourse", "lift"].includes(n.type))
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.level})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Small Google Map Satellite View for Selected Destination & Start Gate */}
          {selectedDestNode && (
            <StationSatellitePreview
              node={selectedDestNode}
              startNode={selectedStartNode}
              title={`Aerial Footprint: ${selectedDestNode.label}`}
              defaultHeight={175}
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label htmlFor="route-pref" style={{ fontSize: 13, fontWeight: 600 }}>
                  Preference:
                </label>
                <select
                  id="route-pref"
                  value={pref}
                  onChange={(e) => setPref(e.target.value)}
                  disabled={stepFreeOnly}
                  style={{ padding: "6px 10px", fontSize: 13 }}
                >
                  <option value="fastest">Fastest (Escalator / Up)</option>
                  <option value="least-walking">Least Walking</option>
                  <option value="fewer-stairs">Fewer Stairs</option>
                </select>
              </div>

              <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "var(--deep-green)" }}>
                <input
                  type="checkbox"
                  checked={stepFreeOnly}
                  onChange={(e) => setStepFreeOnly(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--primary-green)" }}
                />
                <Accessibility size={16} />
                <span>Step-Free Elevator Route Only</span>
              </label>
            </div>

            <button type="submit" className="button" style={{ padding: "11px 24px" }}>
              Find My Route <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* Transit Quick-Actions Bar */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <Link
            href="/navigation?dest=platform-1"
            className="station-strip"
            style={{ textDecoration: "none" }}
          >
            <span className="platform-badge p1">P1</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Find Platform 1</div>
              <div className="muted" style={{ fontSize: 11 }}>PCMC • Purple Line</div>
            </div>
          </Link>

          <Link
            href="/navigation?dest=platform-2"
            className="station-strip"
            style={{ textDecoration: "none" }}
          >
            <span className="platform-badge p2">P2</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Find Platform 2</div>
              <div className="muted" style={{ fontSize: 11 }}>Swargate • Purple Line</div>
            </div>
          </Link>

          <Link
            href="/navigation?dest=exit-a"
            className="station-strip"
            style={{ textDecoration: "none" }}
          >
            <span className="platform-badge" style={{ background: "#C67D0A" }}>EX</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Find Best Exit</div>
              <div className="muted" style={{ fontSize: 11 }}>Bus Stand & Pune Rly Stn</div>
            </div>
          </Link>

          <Link
            href="/qr"
            className="station-strip"
            style={{ textDecoration: "none" }}
          >
            <span className="platform-badge" style={{ background: "#147D5A" }}>QR</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Scan Station QR</div>
              <div className="muted" style={{ fontSize: 11 }}>Pillar & counter codes</div>
            </div>
          </Link>

          <Link
            href="/lost"
            className="station-strip"
            style={{ textDecoration: "none", borderLeftColor: "var(--warning-red)" }}
          >
            <span className="platform-badge" style={{ background: "var(--warning-red)" }}>!</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--warning-red)" }}>I'm Lost</div>
              <div className="muted" style={{ fontSize: 11 }}>Recovery & staff help</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Animated Interactive Maharashtra Metro Map */}
      <div style={{ marginTop: 24 }} className="animate-fade-in-up">
        <MaharashtraMetroMap />
      </div>

      {/* Two Column Operational Info */}
      <div className="two" style={{ marginTop: 22 }}>
        {/* Left: Station Overview & Lines */}
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Civil Court Interchange Layout</h2>
            <span className="pill green">Pilot Station Model</span>
          </div>

          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
            Civil Court is the major multi-level interchange station connecting Line 1 (PCMC – Swargate) and Line 2 (Vanaz – Ramwadi).
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-alt)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <b style={{ fontSize: 13 }}>Level 0 — Street & Entrances</b>
                <span className="pill">Ground</span>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Gate 1 (North - Bus Stand Side) & Gate 2 (South - Rail Side with Step-Free Wheelchair Ramp).
              </div>
            </div>

            <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-alt)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <b style={{ fontSize: 13 }}>Level C — Concourse & Fare Gates</b>
                <span className="pill green">Accessible Central Lift</span>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Customer Care counter, QR Ticket Vending Machines (TVMs), baggage scanners, and active green AFC fare gates.
              </div>
            </div>

            <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-alt)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <b style={{ fontSize: 13 }}>Level 1 — Elevated Platforms</b>
                <span className="pill">Boarding</span>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Platform 1 (Northbound to PCMC) via North Escalator/Lift; Platform 2 (Southbound to Swargate) via South Escalator/Lift.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Link href="/navigation" className="button secondary" style={{ width: "100%", justifyContent: "center" }}>
              Open Interactive Station Schematic Diagram →
            </Link>
          </div>
        </section>

        {/* Right: Station Assistance & Tools */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Lost Assistance Banner */}
          <section className="card card-alert-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <ShieldAlert size={18} color="var(--warning-red)" />
              <h2 style={{ margin: 0, fontSize: 16, color: "var(--warning-red)" }}>Passenger Assistance</h2>
            </div>
            <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
              If you took the wrong staircase or cannot find the elevator, follow our sequential recovery steps.
            </p>
            <Link href="/lost" className="button danger" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
              Open Station Assistance
            </Link>
          </section>

          {/* Multimodal Journey Planner Link */}
          <section className="card">
            <h2 style={{ fontSize: 16, margin: "0 0 6px" }}>Door-to-Door Journey Planner</h2>
            <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
              Compare illustrative metro + walk vs first-mile auto options across Pune.
            </p>
            <Link href="/planner" className="button secondary" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
              Compare City Journeys →
            </Link>
          </section>

          {/* Travel History & Expenses */}
          <section className="card">
            <h2 style={{ fontSize: 16, margin: "0 0 6px" }}>Travel History & Expenses</h2>
            <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
              Log your daily metro fares and auto connections locally in your browser.
            </p>
            <Link href="/expenses" className="button outline" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
              View Travel Records
            </Link>
          </section>
        </div>
      </div>

      {/* Grounding Notice */}
      <div className="notice" style={{ marginTop: 24, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>Official Wayfinding Notice:</b> MetroMate is an independent wayfinding tool calibrated for demonstration using pilot station node coordinates. During station operations or construction maintenance, always heed overhead signage and instructions from uniformed Pune Metro personnel.
        </span>
      </div>
    </div>
  );
}
