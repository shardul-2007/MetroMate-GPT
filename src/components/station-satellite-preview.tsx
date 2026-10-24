"use client";

import { useState } from "react";
import { StationNode } from "@/lib/graph";
import {
  ExternalLink,
  MapPin,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Info,
  Navigation,
  Eye,
  EyeOff,
} from "lucide-react";

interface StationSatellitePreviewProps {
  node?: StationNode | null;
  startNode?: StationNode | null;
  title?: string;
  defaultHeight?: number;
  compact?: boolean;
}

export function StationSatellitePreview({
  node,
  startNode,
  title = "Station Aerial Satellite View",
  defaultHeight = 185,
  compact = false,
}: StationSatellitePreviewProps) {
  // Focus selection: 'destination' or 'origin'
  const [focusTarget, setFocusTarget] = useState<"destination" | "origin">("destination");
  const [mapType, setMapType] = useState<"h" | "k" | "m">("h");
  const [zoom, setZoom] = useState<number>(18);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const activeNode = focusTarget === "origin" && startNode ? startNode : (node || startNode);

  // Fallback coordinates to Pune Central Civil Court Interchange
  const lat = activeNode?.lat ?? 18.52845;
  const lng = activeNode?.lng ?? 73.85405;
  const landmark = activeNode?.landmark ?? "Pune Central Metro Station Complex";
  const nodeLabel = activeNode?.label ?? "Selected Station Location";
  const nodeLevel = activeNode?.level ?? "Ground";

  // Google Maps embed URL
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const currentHeight = isExpanded ? 320 : defaultHeight;

  return (
    <div
      className="station-satellite-container animate-fade-in"
      style={{
        marginTop: 12,
        borderRadius: 8,
        border: "1px solid var(--border-color)",
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Top Header Control Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#1A241E",
          color: "#ffffff",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(20, 125, 90, 0.4)",
              border: "1px solid #147D5A",
              color: "#6ee7b7",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
                display: "inline-block",
              }}
            />
            Google Satellite
          </span>

          {/* Toggle between Origin and Destination when both provided */}
          {startNode && node && (
            <div
              style={{
                display: "inline-flex",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 4,
                padding: 2,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setFocusTarget("destination")}
                style={{
                  background: focusTarget === "destination" ? "var(--primary-green)" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 3,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: focusTarget === "destination" ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                🎯 Destination
              </button>
              <button
                type="button"
                onClick={() => setFocusTarget("origin")}
                style={{
                  background: focusTarget === "origin" ? "var(--primary-green)" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 3,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: focusTarget === "origin" ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                📍 Start Gate
              </button>
            </div>
          )}

          {!startNode && (
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6" }}>
              {title}
            </span>
          )}
        </div>

        {/* View Controls & Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Layer switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 4,
              padding: 2,
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => setMapType("h")}
              title="Hybrid Satellite with Street Labels"
              style={{
                background: mapType === "h" ? "var(--primary-green)" : "transparent",
                color: "#ffffff",
                border: "none",
                borderRadius: 3,
                padding: "2px 7px",
                fontSize: 11,
                fontWeight: mapType === "h" ? 700 : 500,
                cursor: "pointer",
              }}
            >
              Hybrid
            </button>
            <button
              type="button"
              onClick={() => setMapType("k")}
              title="Pure Satellite Aerial"
              style={{
                background: mapType === "k" ? "var(--primary-green)" : "transparent",
                color: "#ffffff",
                border: "none",
                borderRadius: 3,
                padding: "2px 7px",
                fontSize: 11,
                fontWeight: mapType === "k" ? 700 : 500,
                cursor: "pointer",
              }}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("m")}
              title="Road Map"
              style={{
                background: mapType === "m" ? "var(--primary-green)" : "transparent",
                color: "#ffffff",
                border: "none",
                borderRadius: 3,
                padding: "2px 7px",
                fontSize: 11,
                fontWeight: mapType === "m" ? 700 : 500,
                cursor: "pointer",
              }}
            >
              Map
            </button>
          </div>

          {/* Zoom controls */}
          <div style={{ display: "flex", gap: 2 }}>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 1, 20))}
              title="Zoom In"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "none",
                borderRadius: 3,
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ZoomIn size={12} />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 1, 15))}
              title="Zoom Out"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "none",
                borderRadius: 3,
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ZoomOut size={12} />
            </button>
          </div>

          {/* Expand / Minimize toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize preview height" : "Expand preview height"}
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "none",
              borderRadius: 3,
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          {/* Collapse/Hide toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Hide Satellite Map" : "Show Satellite Map"}
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "none",
              borderRadius: 3,
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isOpen ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>

          {/* External Google Maps Link */}
          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              background: "#F2B544",
              color: "#1E2922",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 4,
              textDecoration: "none",
            }}
          >
            Maps <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Map Display Frame - collapsible */}
      {isOpen ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: currentHeight,
            background: "#121815",
            overflow: "hidden",
          }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{
              border: 0,
              display: "block",
              filter: "contrast(1.05) brightness(0.98)",
            }}
            loading="lazy"
            allowFullScreen={false}
            referrerPolicy="no-referrer-when-downgrade"
            title={`Google Maps Satellite View for ${nodeLabel}`}
          />

          {/* Live Overlay Badge on Map */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              right: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
              background: "rgba(26, 36, 30, 0.92)",
              backdropFilter: "blur(6px)",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <MapPin size={14} color="#F2B544" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 700, color: "#ffffff" }}>
                  {nodeLabel}
                </span>
                <span style={{ color: "#9ca3af", marginLeft: 6, fontSize: 11 }}>
                  ({nodeLevel})
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, flexShrink: 0 }}>
              <span
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "1px 6px",
                  borderRadius: 3,
                  fontFamily: "monospace",
                  color: "#e5e7eb",
                }}
              >
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "8px 12px",
            background: "#F5F5F0",
            fontSize: 12,
            color: "var(--muted)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Satellite map collapsed. Click the eye icon to expand.</span>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="button outline"
            style={{ padding: "2px 8px", fontSize: 11, height: 24 }}
          >
            Show Satellite Map
          </button>
        </div>
      )}

      {/* Practical Wayfinding Context Strip below map */}
      <div
        style={{
          padding: "7px 12px",
          background: "#F8F9F7",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11.5,
          color: "var(--deep-green)",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Info size={13} color="var(--primary-green)" style={{ flexShrink: 0 }} />
          <span>
            <b>Physical Landmark:</b> {landmark}
          </span>
        </div>

        <span className="muted" style={{ fontSize: 11 }}>
          Pune Central (Civil Court) Aerial Footprint
        </span>
      </div>
    </div>
  );
}
