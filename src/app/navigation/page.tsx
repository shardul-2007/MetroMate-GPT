"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
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
  Train,
  Zap,
  ArrowDownUp,
  AlertTriangle,
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
import { StationSatellitePreview } from "@/components/station-satellite-preview";

function NavigationContent() {
  const router = useRouter();
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
  const [reportModal, setReportModal] = useState(false);

  // Read query params on mount
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
  useEffect(() => {
    if (startId && destId) {
      const comparisons = compareAllRoutes(station, startId, destId);
      setAllRoutes(comparisons);
      setActiveRoute(comparisons[preference]);
    }
  }, [startId, destId, preference]);

  const handleSwap = () => {
    const temp = startId;
    setStartId(destId);
    setDestId(temp);
    setCurrentStepIndex(0);
    setIsNavigating(false);
  };

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
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      {/* Area A: Station and Route Context Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="eyebrow" style={{ margin: 0 }}>Wayfinding System</span>
            <span className="badge verified">Verified Demo Pilot</span>
          </div>
          <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>{station.name}</span>
          </h1>
          <p className="sub" style={{ margin: 0 }}>
            {station.line} • Indoor pedestrian wayfinding and platform navigation.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="button secondary"
            onClick={() => setShowQrModal(true)}
            aria-label="Scan Station QR Code"
          >
            <QrCode size={16} /> Scan Station QR
          </button>

          <Link href="/qr" className="button outline" style={{ fontSize: 13 }}>
            QR Catalog
          </Link>
        </div>
      </div>

      {/* QR Banner Notification */}
      {qrStatus && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: qrStatus.success ? "#E8F2EC" : "#FDE8E8",
            border: `1px solid ${qrStatus.success ? "#C4DEC9" : "#F8B4B4"}`,
            color: qrStatus.success ? "var(--deep-green)" : "var(--warning-red)",
            fontSize: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {qrStatus.success ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
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

      {/* Origin, Destination & Preference Selector Card */}
      <section className="card card-transit-panel" style={{ marginTop: 16 }}>
        <div className="row">
          <div className="field">
            <label htmlFor="start-location" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={15} color="#059669" />
              <span>Current Starting Location</span>
            </label>
            <select
              id="start-location"
              value={startId}
              onChange={(e) => {
                setStartId(e.target.value);
                setCurrentStepIndex(0);
              }}
            >
              <optgroup label="Entrances & Gates">
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
                <span>Destination Goal</span>
              </label>
              <button
                type="button"
                onClick={handleSwap}
                className="button outline"
                style={{ padding: "2px 8px", fontSize: 11, height: 22, gap: 4 }}
                title="Swap origin and destination"
              >
                <ArrowDownUp size={11} /> Swap
              </button>
            </div>
            <select
              id="dest-location"
              value={destId}
              onChange={(e) => {
                setDestId(e.target.value);
                setCurrentStepIndex(0);
              }}
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

        {/* Route Preference Selector Tabs */}
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--secondary-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Routing Preference:
          </label>
          <div className="tab-group">
            <button
              type="button"
              className={`tab-btn ${preference === "fastest" ? "active" : ""}`}
              onClick={() => {
                setPreference("fastest");
                setCurrentStepIndex(0);
              }}
            >
              <Zap size={14} /> Fastest Route
            </button>
            <button
              type="button"
              className={`tab-btn ${preference === "least-walking" ? "active" : ""}`}
              onClick={() => {
                setPreference("least-walking");
                setCurrentStepIndex(0);
              }}
            >
              <Footprints size={14} /> Least Walking
            </button>
            <button
              type="button"
              className={`tab-btn ${preference === "step-free" ? "active" : ""}`}
              onClick={() => {
                setPreference("step-free");
                setCurrentStepIndex(0);
              }}
            >
              <Accessibility size={14} /> Step-Free (Elevator)
            </button>
            <button
              type="button"
              className={`tab-btn ${preference === "fewer-stairs" ? "active" : ""}`}
              onClick={() => {
                setPreference("fewer-stairs");
                setCurrentStepIndex(0);
              }}
            >
              <Layers size={14} /> Fewer Stairs
            </button>
          </div>
        </div>

        {/* Small Google Map Satellite View for Destination & Origin */}
        {destNode && (
          <StationSatellitePreview
            node={destNode}
            startNode={startNode}
            title={`Destination Satellite View • ${destNode.label}`}
            defaultHeight={180}
          />
        )}
      </section>

      {/* Area B: Visual Station Route (Schematic Diagram) */}
      {activeRoute && activeRoute.edges.length > 0 && (
        <section className="card" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Compass size={18} color="var(--primary-green)" />
              <h2 style={{ fontSize: 16, margin: 0 }}>Schematic Station Wayfinding Diagram</h2>
            </div>
            <span className="badge" style={{ fontSize: 11 }}>
              Schematic Path • {activeRoute.edges.length} Nodes
            </span>
          </div>

          <p className="muted" style={{ fontSize: 12, margin: "0 0 12px" }}>
            Visual connection flow from start through station infrastructure to your destination:
          </p>

          <div className="schematic-canvas">
            <div className="schematic-flow">
              {/* Initial node */}
              <div
                className={`schematic-node ${
                  isNavigating && currentStepIndex === 0 ? "active" : isNavigating ? "passed" : ""
                }`}
              >
                <div className="schematic-icon">
                  <MapPin size={18} />
                </div>
                <b style={{ fontSize: 11, color: "var(--primary-text)", maxWidth: 100 }}>
                  {station.nodes.find((n) => n.id === activeRoute.edges[0].from)?.label.split("(")[0]}
                </b>
                <span className="pill" style={{ fontSize: 9 }}>
                  {station.nodes.find((n) => n.id === activeRoute.edges[0].from)?.level}
                </span>
              </div>

              {/* Edge connectors and intermediate nodes */}
              {activeRoute.edges.map((edge, idx) => {
                const toNode = station.nodes.find((n) => n.id === edge.to);
                const isTraversed = isNavigating && currentStepIndex >= idx;
                const isCurrent = isNavigating && currentStepIndex === idx;

                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 100 }}>
                    <div className={`schematic-connector ${isTraversed ? "active" : ""}`}>
                      <span
                        style={{
                          position: "absolute",
                          top: -16,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--secondary-text)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {edge.distanceM}m
                        {edge.lift ? " [Lift]" : edge.escalator ? " [Esc]" : edge.stairs ? " [Stairs]" : ""}
                      </span>
                    </div>

                    <div className={`schematic-node ${isCurrent ? "active" : isTraversed ? "passed" : ""}`}>
                      <div className="schematic-icon">
                        {toNode?.type === "platform" ? (
                          <Train size={18} />
                        ) : toNode?.type === "lift" ? (
                          <Accessibility size={18} />
                        ) : toNode?.type === "exit" ? (
                          <ArrowRight size={18} />
                        ) : (
                          <Footprints size={18} />
                        )}
                      </div>
                      <b style={{ fontSize: 11, color: "var(--primary-text)", maxWidth: 100 }}>
                        {toNode?.label.split("(")[0]}
                      </b>
                      <span className="pill" style={{ fontSize: 9 }}>
                        {toNode?.level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Alternative Route Summary Pills */}
      {allRoutes && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
          {(["fastest", "least-walking", "step-free", "fewer-stairs"] as NavigationPreference[]).map((key) => {
            const r = allRoutes[key];
            const isSelected = preference === key;
            const unreachable = r.unreachableMessage !== undefined;

            return (
              <div
                key={key}
                className="card"
                style={{
                  padding: 14,
                  cursor: unreachable ? "not-allowed" : "pointer",
                  borderLeft: isSelected ? "4px solid var(--primary-green)" : "1px solid var(--border)",
                  background: isSelected ? "#F8FAF8" : "#FFFFFF",
                }}
                onClick={() => {
                  if (!unreachable) {
                    setPreference(key);
                    setCurrentStepIndex(0);
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 13, color: isSelected ? "var(--deep-green)" : "var(--primary-text)" }}>
                    {r.title}
                  </b>
                  {isSelected && <span className="pill green">Active</span>}
                </div>

                {unreachable ? (
                  <p className="muted" style={{ fontSize: 11, color: "var(--warning-red)", margin: "6px 0 0" }}>
                    {r.unreachableMessage}
                  </p>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline", margin: "6px 0" }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{Math.ceil(r.totalTimeSec / 60)} min</span>
                      <span className="muted" style={{ fontSize: 12 }}>({r.totalDistanceM} m)</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {r.isStepFree ? (
                        <span className="pill green">Step-free</span>
                      ) : r.hasStairs ? (
                        <span className="pill amber">{r.stairFlightCount} stairs</span>
                      ) : null}
                      {r.hasLift && <span className="pill green">Lift</span>}
                      {r.hasEscalator && <span className="pill">Escalator</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Area C: Step-by-Step Directions (Turn-by-Turn Transit Style) */}
      {activeRoute && activeRoute.edges.length > 0 && (
        <section className="card card-transit-panel" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <span className="eyebrow" style={{ color: "var(--deep-green)" }}>
                {activeRoute.title} • {startNode?.label.split("(")[0]} to {destNode?.label.split("(")[0]}
              </span>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--secondary-text)" }}>
                Total: {activeRoute.totalDistanceM} m • ~{Math.ceil(activeRoute.totalTimeSec / 60)} min • {activeRoute.edges.length} steps
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {!isNavigating ? (
                <button className="button" onClick={startNavigation}>
                  Start Navigation <ArrowRight size={16} />
                </button>
              ) : (
                <button className="button secondary" onClick={restartJourney}>
                  <RotateCcw size={15} /> Restart
                </button>
              )}
            </div>
          </div>

          {/* Transit Step Progress Tracker */}
          {isNavigating && currentEdge && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 700, color: "var(--secondary-text)" }}>
                <span>
                  STEP {currentStepIndex + 1} OF {activeRoute.edges.length}
                </span>
                <span>{Math.round(((currentStepIndex + 1) / activeRoute.edges.length) * 100)}% COMPLETE</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentStepIndex + 1) / activeRoute.edges.length) * 100}%` }}
                />
              </div>

              {/* Primary Direction Card */}
              <div
                style={{
                  background: "#F7FAF8",
                  border: "2px solid var(--primary-green)",
                  borderRadius: "var(--radius-md)",
                  padding: 20,
                  margin: "12px 0 16px",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="number" style={{ width: 36, height: 36, fontSize: 16 }}>
                    {currentStepIndex + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span className="badge">
                        From: {station.nodes.find((n) => n.id === currentEdge.from)?.label}
                      </span>
                      <ArrowRight size={13} color="var(--secondary-text)" />
                      <span className="badge" style={{ background: "#F0F4F1" }}>
                        Towards: {station.nodes.find((n) => n.id === currentEdge.to)?.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, margin: "6px 0 10px", color: "var(--primary-text)", lineHeight: 1.4 }}>
                      {currentEdge.instruction}
                    </h3>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
                      <span className="pill">
                        <Footprints size={12} /> {currentEdge.distanceM} meters
                      </span>
                      <span className="pill">
                        <Clock size={12} /> ~{currentEdge.timeSec}s walk
                      </span>
                      {currentEdge.stepFree && <span className="pill green">Step-free path</span>}
                      {currentEdge.lift && <span className="pill green">Central Elevator</span>}
                      {currentEdge.escalator && <span className="pill">Escalator</span>}
                      {currentEdge.stairs && <span className="pill amber">Stair flight</span>}
                      {currentEdge.verified ? (
                        <span className="pill green">Verified Layout</span>
                      ) : (
                        <span className="pill amber">Calibrated Model</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next / Previous Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: "1px solid var(--border)",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <button
                    className="button outline"
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      className="button outline"
                      onClick={() => setReportModal(true)}
                      style={{ fontSize: 12, padding: "8px 12px" }}
                    >
                      <AlertTriangle size={14} color="#8C5E09" /> Report Problem
                    </button>

                    <Link
                      href={`/assistant?q=${encodeURIComponent(
                        `Step ${currentStepIndex + 1} at Pune Metro (${currentEdge.instruction}): Can you clarify this direction or check if an alternate route is available?`
                      )}`}
                      className="button secondary"
                      style={{ fontSize: 13 }}
                    >
                      <Sparkles size={14} /> Clarify with AI
                    </Link>

                    {currentStepIndex < activeRoute.edges.length - 1 ? (
                      <button className="button" onClick={nextStep}>
                        Next Step <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="button"
                        style={{ background: "#0E6044" }}
                        onClick={() => alert("✓ You have arrived at your destination inside Pune Metro!")}
                      >
                        Destination Reached ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Sequential Itinerary */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Sequential Wayfinding Steps</h3>
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
                      <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
                        {edge.instruction}
                      </p>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 12, color: "var(--secondary-text)" }}>
                        <span>
                          {fromNode?.label.split("(")[0]} → {toNode?.label.split("(")[0]}
                        </span>
                        <span>•</span>
                        <span>{edge.distanceM} m</span>
                        <span>•</span>
                        <span>~{edge.timeSec}s</span>
                      </div>
                    </div>
                    {isCurrent && <span className="pill green">Active</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Safety Notice */}
      <div className="notice" style={{ marginTop: 22, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>Passenger Safety:</b> Always confirm direction with overhead station signage before stepping onto platform edges or escalators. If you require wheelchair ramp boarding, notify Customer Care at the concourse level.
        </span>
      </div>

      {/* Modal for QR Code Scanning & Manual Payload Entry */}
      {showQrModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(32, 41, 35, 0.65)",
            backdropFilter: "blur(3px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="card"
            style={{ width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto", borderTop: "4px solid var(--primary-green)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <QrCode size={20} color="var(--primary-green)" />
                <h3 style={{ margin: 0, fontSize: 17 }}>Scan Station QR Code</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: "none", border: "none", fontSize: 18, fontWeight: 700, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p className="muted" style={{ fontSize: 13 }}>
              Enter or scan the location code displayed on the physical wayfinding plaque mounted on station pillars or fare gates:
            </p>

            <div style={{ marginTop: 14 }} className="form">
              <div className="field">
                <label htmlFor="qr-payload-input">Station QR Payload / Code:</label>
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
                Set As My Current Location
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--secondary-text)", marginBottom: 8, textTransform: "uppercase" }}>
                Quick Test Codes (1-Click Station Nodes):
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {sampleQrPayloads.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="button secondary"
                    style={{ fontSize: 12, padding: "5px 9px" }}
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

      {/* Report Problem Modal */}
      {reportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(32, 41, 35, 0.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setReportModal(false)}
        >
          <div
            className="card"
            style={{ width: "min(460px, 100%)", borderTop: "4px solid var(--warning-red)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Report Wayfinding Problem</h3>
              <button onClick={() => setReportModal(false)} style={{ border: 0, background: "none", fontSize: 16, fontWeight: 700 }}>✕</button>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>
              Is this corridor closed, undergoing maintenance, or are stairs blocked?
            </p>
            <div className="form" style={{ marginTop: 12 }}>
              <select defaultValue="lift-out">
                <option value="lift-out">Elevator / Lift out of service</option>
                <option value="escalator-stopped">Escalator stopped / maintenance</option>
                <option value="gate-locked">Exit gate or door locked</option>
                <option value="sign-mismatch">Station sign does not match app step</option>
              </select>
              <button
                className="button"
                onClick={() => {
                  alert("Thank you. This incident has been recorded in local demo logs. Please consult station staff for active assistance.");
                  setReportModal(false);
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavigationPage() {
  return (
    <Suspense fallback={<div className="card">Loading Station Wayfinding System...</div>}>
      <NavigationContent />
    </Suspense>
  );
}
