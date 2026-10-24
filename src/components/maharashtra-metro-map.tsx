"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Route,
  Train,
  Zap,
} from "lucide-react";
import metroData from "@/data/maharashtra-metro.json";

export function MaharashtraMetroMap() {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("pune");
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>("civil-court");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [routeFrom, setRouteFrom] = useState<string>("vanaz");
  const [routeTo, setRouteTo] = useState<string>("pcmc");
  const [animateRoute, setAnimateRoute] = useState<boolean>(true);

  const currentNetwork =
    metroData.networks.find((n) => n.id === selectedNetworkId) || metroData.networks[0];

  const allStations = currentNetwork.lines.flatMap((line) =>
    line.stations.map((s) => ({ ...s, lineId: line.id, lineColor: line.color, lineName: line.name }))
  );

  const selectedStation = allStations.find((s) => s.id === selectedStationId);

  // Find start and end stations for route illustration
  const startStation = allStations.find((s) => s.id === routeFrom);
  const endStation = allStations.find((s) => s.id === routeTo);

  return (
    <div
      className="card card-transit-panel"
      style={{ padding: 18, background: "#FFFFFF", position: "relative" }}
    >
      {/* Map Header & Network Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Train size={18} color="var(--primary-green)" />
            <h2 style={{ fontSize: 17, margin: 0 }}>Maharashtra Metro Network Explorer</h2>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            Interactive schematic route diagrams for operational Maharashtra metro transit
          </span>
        </div>

        {/* Network City Tabs */}
        <div style={{ display: "flex", gap: 6, background: "var(--surface-alt)", padding: 4, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          {metroData.networks.map((net) => {
            const isSelected = net.id === selectedNetworkId;
            return (
              <button
                key={net.id}
                type="button"
                className={`tab-btn ${isSelected ? "active" : ""}`}
                style={{ padding: "5px 12px", fontSize: 12 }}
                onClick={() => {
                  setSelectedNetworkId(net.id);
                  setSelectedLineId(null);
                  if (net.id === "pune") {
                    setSelectedStationId("civil-court");
                    setRouteFrom("vanaz");
                    setRouteTo("pcmc");
                  } else if (net.id === "mumbai") {
                    setSelectedStationId("marol-naka");
                    setRouteFrom("versova");
                    setRouteTo("bkc");
                  } else {
                    setSelectedStationId("sitabuldi");
                    setRouteFrom("automotive-sq");
                    setRouteTo("lokmanya-nagar");
                  }
                }}
              >
                {net.city} Metro
              </button>
            );
          })}
        </div>
      </div>

      {/* Network Operator & Zoom Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="badge" style={{ fontSize: 11 }}>
            {currentNetwork.name}
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            • {currentNetwork.lines.length} Lines • {currentNetwork.status}
          </span>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            type="button"
            className="button outline"
            style={{ padding: "4px 8px", height: 28 }}
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <Minus size={13} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, minWidth: 38, textAlign: "center", color: "var(--secondary-text)" }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            className="button outline"
            style={{ padding: "4px 8px", height: 28 }}
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            className="button outline"
            style={{ padding: "4px 8px", height: 28 }}
            onClick={() => setZoomLevel(1)}
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Interactive SVG Schematic Map */}
      <div
        style={{
          width: "100%",
          height: 380,
          background: "#FAFAF7",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 900 500"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
            transition: "transform 0.25s ease",
          }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#EAEAE5" strokeWidth="0.8" />
            </pattern>

            {/* Pulsing Beacon for Selected Station */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="900" height="500" fill="url(#grid)" />

          {/* Draw Metro Lines */}
          {currentNetwork.lines.map((line) => {
            const isLineActive = !selectedLineId || selectedLineId === line.id;
            const points = line.stations.map((s) => `${s.x},${s.y}`).join(" L ");
            const pathData = `M ${points}`;

            return (
              <g key={line.id} opacity={isLineActive ? 1 : 0.25} style={{ transition: "opacity 0.2s" }}>
                {/* Thick background line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Inner track stripe */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 6"
                />

                {/* Animated Directional Route Stroke when active */}
                {animateRoute && isLineActive && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#F2B544"
                    strokeWidth="4"
                    strokeDasharray="12 24"
                    className="animated-transit-flow"
                  />
                )}
              </g>
            );
          })}

          {/* Draw Interchange Connections */}
          {currentNetwork.lines.map((line) =>
            line.stations
              .filter((s) => s.isInterchange)
              .map((s) => (
                <circle
                  key={`interchange-glow-${s.id}`}
                  cx={s.x}
                  cy={s.y}
                  r="16"
                  fill="none"
                  stroke="var(--wayfinding-amber)"
                  strokeWidth="3"
                  className="interchange-ring"
                />
              ))
          )}

          {/* Draw Stations */}
          {currentNetwork.lines.map((line) =>
            line.stations.map((stn) => {
              const isSelected = selectedStationId === stn.id;
              const isInterchange = stn.isInterchange;

              return (
                <g
                  key={`${line.id}-${stn.id}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedStationId(stn.id)}
                >
                  {/* Selected Pulse Ring */}
                  {isSelected && (
                    <circle
                      cx={stn.x}
                      cy={stn.y}
                      r="14"
                      fill="none"
                      stroke="var(--primary-green)"
                      strokeWidth="2.5"
                      className="pulse-station-ring"
                    />
                  )}

                  {/* Station Marker */}
                  <circle
                    cx={stn.x}
                    cy={stn.y}
                    r={isInterchange ? 9 : 6.5}
                    fill="#FFFFFF"
                    stroke={isSelected ? "var(--primary-green)" : isInterchange ? "#202923" : line.color}
                    strokeWidth={isInterchange ? 3.5 : 2.5}
                  />

                  {/* Station Label */}
                  <text
                    x={stn.x}
                    y={stn.y + (stn.y > 360 ? -14 : 18)}
                    textAnchor="middle"
                    fill={isSelected ? "var(--deep-green)" : "#202923"}
                    fontSize={isInterchange ? "11" : "10"}
                    fontWeight={isSelected || isInterchange ? "700" : "500"}
                    fontFamily="Space Grotesk, sans-serif"
                    paintOrder="stroke"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {stn.name}
                  </text>
                </g>
              );
            })
          )}
        </svg>

        {/* Floating Map Legend */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            background: "rgba(255, 255, 255, 0.94)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            fontSize: 11,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--deep-green)", marginBottom: 2 }}>Line Network Legend</div>
          {currentNetwork.lines.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                fontWeight: selectedLineId === l.id ? 700 : 500,
              }}
              onClick={() => setSelectedLineId(selectedLineId === l.id ? null : l.id)}
            >
              <span style={{ width: 12, height: 4, background: l.color, borderRadius: 2 }} />
              <span>{l.name}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, paddingTop: 4, borderTop: "1px solid var(--border)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #202923", background: "#FFF" }} />
            <span>Interchange Hub</span>
          </div>
        </div>

        {/* Live Simulation Notice */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            background: "rgba(255, 255, 255, 0.94)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 8px",
            fontSize: 10,
            color: "var(--secondary-text)",
            fontWeight: 600,
          }}
        >
          Schematic Route Map • Not live train positions
        </div>
      </div>

      {/* Selected Station Information & Wayfinding Hook */}
      {selectedStation && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-alt)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={16} color="var(--primary-green)" />
              <b style={{ fontSize: 15 }}>{selectedStation.name}</b>
              {selectedStation.isInterchange && <span className="pill amber">Interchange Hub</span>}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Line: <b>{selectedStation.lineName}</b> • Network: {currentNetwork.city} Metro
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {"hasIndoorWayfinding" in selectedStation && selectedStation.hasIndoorWayfinding ? (
              <Link
                href="/navigation"
                className="button"
                style={{ fontSize: 12, padding: "7px 12px", gap: 6 }}
              >
                <Compass size={14} /> Open Station Indoor Wayfinding (Pilot)
              </Link>
            ) : (
              <Link
                href={`/planner?from=${encodeURIComponent(selectedStation.name)}`}
                className="button secondary"
                style={{ fontSize: 12, padding: "7px 12px" }}
              >
                Plan Journey From Here
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
