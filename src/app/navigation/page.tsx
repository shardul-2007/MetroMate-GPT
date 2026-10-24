"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Footprints,
  Info,
  Layers,
  MapPin,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getPilotStation,
  calculateRoute,
  compareAllRoutes,
  validateQrPayload,
  sampleQrPayloads,
  NavigationPreference,
  ComputedRoute,
  StationNode,
} from "@/lib/graph";

function NavigationContent() {
  const searchParams = useSearchParams();
  const station = getPilotStation();

  // State
  const [startId, setStartId] = useState<string>("entrance-north");
  const [destId, setDestId] = useState<string>("platform-1");
  const [preference, setPreference] = useState<NavigationPreference>("fastest");
  const [activeRoute, setActiveRoute] = useState<ComputedRoute | null>(null);
  const [allRoutes, setAllRoutes] = useState<Record<NavigationPreference, ComputedRoute> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // QR state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrStatus, setQrStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Read query params on mount (e.g., from QR scan or home page shortcuts)
  useEffect(() => {
    const queryStart = searchParams.get("start");
    const queryDest = searchParams.get("dest");
    const queryPref = searchParams.get("pref") as NavigationPreference | null;
    const queryQr = searchParams.get("qr");

    if (queryStart && station.nodes.some((n) => n.id === queryStart)) {
      setStartId(queryStart);
    }
    if (queryDest && station.nodes.some((n) => n.id === queryDest)) {
      setDestId(queryDest);
    }
    if (queryPref && ["fastest", "least-walking", "step-free", "fewer-stairs"].includes(queryPref)) {
      setPreference(queryPref);
    }
    if (queryQr) {
      handleValidateQr(queryQr);
    }
  }, [searchParams, station.nodes]);

  // Compute routes
  const handleCalculateRoutes = () => {
    if (!startId || !destId) return;
    const comparisons = compareAllRoutes(station, startId, destId);
    setAllRoutes(comparisons);
    setActiveRoute(comparisons[preference]);
    setIsNavigating(false);
    setCurrentStepIndex(0);
  };

  // Re-run comparison when start or dest changes
  useEffect(() => {
    if (startId && destId) {
      const comparisons = compareAllRoutes(station, startId, destId);
      setAllRoutes(comparisons);
      setActiveRoute(comparisons[preference]);
    }
  }, [startId, destId, preference]);

  // QR handling
  const handleValidateQr = (payload: string) => {
    const result = validateQrPayload(payload);
    if (result.valid && result.node) {
      setStartId(result.node.id);
      setQrStatus({
        success: true,
        message: `Verified station location: ${result.node.label} (${result.node.level})`,
      });
      setShowQrModal(false);
    } else {
      setQrStatus({
        success: false,
        message: result.error || "Invalid QR payload",
      });
    }
  };

  // Step navigation
  const nextStep = () => {
    if (activeRoute && currentStepIndex < activeRoute.edges.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const restartJourney = () => {
    setCurrentStepIndex(0);
    setIsNavigating(false);
  };

  const startNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
  };

  const startNode = station.nodes.find((n) => n.id === startId);
  const destNode = station.nodes.find((n) => n.id === destId);
  const currentEdge = activeRoute?.edges[currentStepIndex];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="eyebrow">Indoor Wayfinding & Navigation</p>
          <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Compass size={32} color="#6950d5" />
            Station Navigator
          </h1>
          <p className="sub">
            Turn-by-turn guidance inside Pune Metro stations — from entrance gates, ticket vending machines, and concourse halls straight to your platform and verified exit.
          </p>
        </div>

        <button
          className="button secondary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={() => setShowQrModal(true)}
          aria-label="Scan Station QR Code"
        >
          <QrCode size={18} />
          Scan Station QR
        </button>
      </div>

      {/* QR Banner feedback */}
      {qrStatus && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: qrStatus.success ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${qrStatus.success ? "#a7f3d0" : "#fecaca"}`,
            color: qrStatus.success ? "#065f46" : "#991b1b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            {qrStatus.success ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
            <span>{qrStatus.message}</span>
          </div>
          <button
            onClick={() => setQrStatus(null)}
            style={{ background: "none", border: "none", color: "inherit", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Station Selector & Configuration Card */}
      <section className="card card-hero" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <span className="badge demo">Pilot Pilot Model</span>
            <span className="badge" style={{ marginLeft: 8 }}>
              {station.name}
            </span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            Line: {station.line}
          </span>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="start-location" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={16} color="#059669" />
              Starting Location (Where are you now?)
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
              <optgroup label="Concourse & Ticketing">
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
            <label htmlFor="dest-location" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={16} color="#6950d5" />
              Destination (Where do you need to go?)
            </label>
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
              <optgroup label="Exits & Transit Connections">
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
                  .filter((n) => ["ticket", "concourse"].includes(n.type))
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.level})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Preferences Tabs */}
        <div style={{ marginTop: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
            Route Preferences
          </label>
          <div className="tab-group">
            <button
              type="button"
              className={`tab-btn ${preference === "fastest" ? "active" : ""}`}
              onClick={() => setPreference("fastest")}
            >
              <Zap size={15} />
              Fastest Route
            </button>
            <button
              type="button"
              className={`tab-btn ${preference === "least-walking" ? "active" : ""}`}
              onClick={() => setPreference("least-walking")}
            >
              <Footprints size={15} />
              Least Walking
            </button>
            <button
              type="button"
              className={`tab-btn ${preference === "step-free" ? "active" : ""}`}
              onClick={() => setPreference("step-free")}
            >
              <Accessibility size={15} />
              Step-Free (Elevator)
            </button>
            <button
              type="button"
              className={`tab-btn ${preference === "fewer-stairs" ? "active" : ""}`}
              onClick={() => setPreference("fewer-stairs")}
            >
              <Layers size={15} />
              Fewer Stairs
            </button>
          </div>
        </div>
      </section>

      {/* Comparative Route Cards */}
      {allRoutes && (
        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ fontSize: 20 }}>Route Comparison</h2>
            <span className="muted" style={{ fontSize: 13 }}>
              Select an option below to start guided navigation
            </span>
          </div>

          <div className="grid">
            {(["fastest", "least-walking", "step-free", "fewer-stairs"] as NavigationPreference[]).map((prefKey) => {
              const r = allRoutes[prefKey];
              const isSelected = preference === prefKey;
              const isUnreachable = r.unreachableMessage !== undefined;

              return (
                <div
                  key={prefKey}
                  className={`card ${isSelected ? "card-hero" : ""}`}
                  style={{
                    cursor: isUnreachable ? "not-allowed" : "pointer",
                    opacity: isUnreachable ? 0.7 : 1,
                    border: isSelected ? "2px solid #6950d5" : undefined,
                    position: "relative",
                  }}
                  onClick={() => {
                    if (!isUnreachable) {
                      setPreference(prefKey);
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={`badge ${isSelected ? "demo" : ""}`}>{r.title}</span>
                    {isSelected && (
                      <span className="pill green">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    )}
                  </div>

                  {isUnreachable ? (
                    <div style={{ marginTop: 12 }}>
                      <p className="muted" style={{ color: "#c0384d", fontSize: 13 }}>
                        {r.unreachableMessage}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="stat" style={{ fontSize: 22, margin: "12px 0 6px" }}>
                        {Math.ceil(r.totalTimeSec / 60)} min
                        <span className="muted" style={{ fontSize: 14, fontWeight: 500, marginLeft: 8 }}>
                          ({r.totalDistanceM} m)
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
                        {r.isStepFree ? (
                          <span className="pill green">Step-free</span>
                        ) : r.hasStairs ? (
                          <span className="pill amber">{r.stairFlightCount} Stair Flight(s)</span>
                        ) : null}
                        {r.hasLift && <span className="pill purple">Elevator</span>}
                        {r.hasEscalator && <span className="pill purple">Escalator</span>}
                      </div>

                      <p className="muted" style={{ fontSize: 12, lineHeight: 1.4, margin: "10px 0 0" }}>
                        {r.explanation}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Navigation & Step Progression Section */}
      {activeRoute && activeRoute.edges.length > 0 && (
        <section className="card" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <span className="eyebrow">{activeRoute.title}</span>
              <h2 style={{ margin: "4px 0" }}>
                {startNode?.label} → {destNode?.label}
              </h2>
              <p className="muted">
                Total: {activeRoute.totalDistanceM} meters • ~{Math.ceil(activeRoute.totalTimeSec / 60)} min walk • {activeRoute.edges.length} navigation steps
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {!isNavigating ? (
                <button className="button" onClick={startNavigation}>
                  Start Navigation <ArrowRight size={16} />
                </button>
              ) : (
                <button className="button secondary" onClick={restartJourney}>
                  <RotateCcw size={16} /> Restart
                </button>
              )}
            </div>
          </div>

          {/* Step Progression View */}
          {isNavigating && currentEdge && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700, color: "#64748b" }}>
                <span>
                  STEP {currentStepIndex + 1} OF {activeRoute.edges.length}
                </span>
                <span>{Math.round(((currentStepIndex + 1) / activeRoute.edges.length) * 100)}% Completed</span>
              </div>

              {/* Progress bar */}
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentStepIndex + 1) / activeRoute.edges.length) * 100}%` }}
                />
              </div>

              {/* Active Step Highlight Card */}
              <div
                style={{
                  background: "#faf8ff",
                  border: "2px solid #7956e9",
                  borderRadius: 14,
                  padding: 20,
                  margin: "16px 0",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#6950d5",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {currentStepIndex + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span className="badge">
                        {station.nodes.find((n) => n.id === currentEdge.from)?.label}
                      </span>
                      <ArrowRight size={14} color="#64748b" />
                      <span className="badge demo">
                        {station.nodes.find((n) => n.id === currentEdge.to)?.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, margin: "8px 0 10px", color: "#10233e", lineHeight: 1.4 }}>
                      {currentEdge.instruction}
                    </h3>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
                      <span className="pill">
                        <Footprints size={13} /> {currentEdge.distanceM} meters
                      </span>
                      <span className="pill">
                        <Clock size={13} /> ~{currentEdge.timeSec} seconds
                      </span>
                      {currentEdge.stepFree && <span className="pill green">Step-free ramp/floor</span>}
                      {currentEdge.lift && <span className="pill purple">Elevator</span>}
                      {currentEdge.escalator && <span className="pill purple">Escalator</span>}
                      {currentEdge.stairs && <span className="pill amber">Stairs</span>}
                      {currentEdge.verified ? (
                        <span className="pill green">Verified Layout</span>
                      ) : (
                        <span className="pill amber">Demo Layout</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid #e9d5ff",
                  }}
                >
                  <button
                    className="button outline"
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft size={16} /> Previous Step
                  </button>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/assistant?q=${encodeURIComponent(
                        `I am at step ${currentStepIndex + 1} of my journey in Pune Metro station (${currentEdge.instruction}). Can you give me tips or assist me?`
                      )}`}
                      className="button secondary"
                      style={{ fontSize: 13 }}
                    >
                      <Bot size={15} /> Ask AI Assistant
                    </Link>

                    {currentStepIndex < activeRoute.edges.length - 1 ? (
                      <button className="button" onClick={nextStep}>
                        Next Step <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="button mint"
                        onClick={() => alert("🎉 You have arrived at your destination inside Pune Metro!")}
                      >
                        Destination Reached ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Step Timeline */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>All Journey Steps</h3>
            <div className="timeline">
              {activeRoute.edges.map((edge, index) => {
                const isCurrent = isNavigating && currentStepIndex === index;
                const isPassed = isNavigating && currentStepIndex > index;
                const fromNode = station.nodes.find((n) => n.id === edge.from);
                const toNode = station.nodes.find((n) => n.id === edge.to);

                return (
                  <div
                    key={index}
                    className={`step-card ${isCurrent ? "active" : ""}`}
                    style={{
                      opacity: isPassed ? 0.6 : 1,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsNavigating(true);
                      setCurrentStepIndex(index);
                    }}
                  >
                    <div className="number">{index + 1}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>
                        {edge.instruction}
                      </p>
                      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 12, color: "#64748b" }}>
                        <span>
                          {fromNode?.label} → {toNode?.label}
                        </span>
                        <span>•</span>
                        <span>{edge.distanceM} m</span>
                        <span>•</span>
                        <span>~{edge.timeSec}s</span>
                      </div>
                    </div>
                    {isCurrent && <span className="badge demo">Current</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Safety & Grounded Station Notice */}
      <div className="notice" style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <Info size={20} color="#755812" style={{ flexShrink: 0 }} />
        <div>
          <strong>Safety & Station Information Grounding:</strong> Wayfinding paths are calculated from verified pilot station node coordinates for Pune Central (Civil Court). If stairs or lifts are undergoing maintenance, or if path barriers are present, always adhere to official Pune Metro overhead signage and consult station security or customer care staff.
        </div>
      </div>

      {/* Modal for QR Scanner / Manual QR Entry */}
      {showQrModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 35, 62, 0.6)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="card"
            style={{ width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <QrCode size={22} color="#6950d5" />
                <h3 style={{ margin: 0 }}>Scan Station QR Code</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: "none", border: "none", fontSize: 18, fontWeight: 700, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p className="muted" style={{ fontSize: 13 }}>
              In supported metro stations, scan or enter the indoor wayfinding QR plaque mounted on station pillars, ticketing counters, or platform stairwells.
            </p>

            <div style={{ marginTop: 16 }} className="form">
              <div className="field">
                <label htmlFor="qr-payload-input">Enter Station QR Payload / Code:</label>
                <input
                  id="qr-payload-input"
                  type="text"
                  placeholder='e.g. {"system":"pune-metro","stationId":"pune-central","nodeId":"entrance-north"}'
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                />
              </div>

              <button
                className="button"
                onClick={() => handleValidateQr(qrInput)}
                disabled={!qrInput.trim()}
              >
                Validate & Set Starting Location
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 8px" }}>
                Quick Test Sample Payloads (1-Click Demo):
              </p>
              <div className="quick-qr-list">
                {sampleQrPayloads.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="button secondary"
                    style={{ fontSize: 12, padding: "6px 10px" }}
                    onClick={() => {
                      setQrInput(sample.payload);
                      handleValidateQr(sample.payload);
                    }}
                  >
                    📍 {sample.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavigationPage() {
  return (
    <Suspense fallback={<div className="card">Loading Station Navigator...</div>}>
      <NavigationContent />
    </Suspense>
  );
}
