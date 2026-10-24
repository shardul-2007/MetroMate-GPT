"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Compass,
  Footprints,
  Info,
  MapPin,
  QrCode,
  ShieldAlert,
  Train,
  ScanLine,
} from "lucide-react";
import {
  validateQrPayload,
  sampleQrPayloads,
  getAllStations,
  QrValidationResult,
} from "@/lib/graph";

export default function QrScannerPage() {
  const router = useRouter();
  const [payloadInput, setPayloadInput] = useState("");
  const [validation, setValidation] = useState<QrValidationResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleValidate = (code: string) => {
    setPayloadInput(code);
    const result = validateQrPayload(code);
    setValidation(result);
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported by your browser environment. Please use manual code entry.");
        return;
      }
      setCameraActive(true);
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const videoEl = document.getElementById("qr-video-preview") as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play();
      }
    } catch (err: any) {
      setCameraActive(false);
      setIsScanning(false);
      setCameraError(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please use the quick manual payload entry below."
          : "Could not open camera stream. Please use the reliable manual payload buttons below."
      );
    }
  };

  const handleStopCamera = () => {
    const videoEl = document.getElementById("qr-video-preview") as HTMLVideoElement | null;
    if (videoEl && videoEl.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoEl.srcObject = null;
    }
    setCameraActive(false);
    setIsScanning(false);
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <p className="eyebrow">Indoor Wayfinding Identification</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <QrCode size={30} color="var(--primary-green)" />
        <span>Station QR Navigation</span>
      </h1>
      <p className="sub">
        Scan or enter the location code from physical wayfinding plaques mounted on station pillars, ticketing booths, or platform stairwells across Pune Metro.
      </p>

      {/* Operational Notice */}
      <div className="notice" style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>How QR Wayfinding Works:</b> Scanning a station QR code pinpoints your exact indoor starting landmark (e.g. Concourse Fare Gate 3 or Platform 1 Stairwell). It does <i>not</i> provide continuous indoor GPS tracking.
        </span>
      </div>

      <div className="two">
        {/* Left: Input & Camera Scanner */}
        <section className="card card-transit-panel">
          <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>Identify Starting Point</h2>

          {/* Camera Scanning Section with Animated Scan Frame */}
          <div style={{ marginBottom: 18 }}>
            {!cameraActive ? (
              <button
                type="button"
                className="button secondary"
                onClick={handleStartCamera}
                style={{ width: "100%", justifyContent: "center", gap: 8 }}
              >
                <Camera size={16} /> Open Camera Scanner
              </button>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: 230,
                    background: "#0F172A",
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <video id="qr-video-preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                  {/* Target Crosshair & Animated Moving Scan Line */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "15%",
                      border: "2px dashed #147D5A",
                      borderRadius: 8,
                      pointerEvents: "none",
                    }}
                  >
                    {isScanning && <div className="qr-laser-line" />}
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.6)",
                      color: "#FFF",
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    Align QR plaque inside box
                  </div>
                </div>

                <button
                  type="button"
                  className="button outline"
                  onClick={handleStopCamera}
                  style={{ marginTop: 10, fontSize: 12 }}
                >
                  Close Camera
                </button>
              </div>
            )}

            {cameraError && (
              <p className="muted" style={{ color: "var(--warning-red)", fontSize: 12, marginTop: 8 }}>
                {cameraError}
              </p>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <label htmlFor="manual-qr-input" style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>
              Or Enter Station Location Code Manually:
            </label>
            <div className="form">
              <input
                id="manual-qr-input"
                type="text"
                placeholder='e.g. {"system":"pune-metro","stationId":"pune-central","nodeId":"concourse"}'
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
              />
              <button
                className="button"
                type="button"
                onClick={() => handleValidate(payloadInput)}
                disabled={!payloadInput.trim()}
              >
                Validate Location Code
              </button>
            </div>
          </div>

          {/* Resolved Location Preview with Smooth Transition */}
          {validation && (
            <div
              className="animate-fade-in-up"
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: "var(--radius-sm)",
                background: validation.valid ? "#EBF5F0" : "#FDE8E8",
                border: `1px solid ${validation.valid ? "#BBDDCD" : "#F8B4B4"}`,
              }}
            >
              {validation.valid && validation.node && validation.station ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--deep-green)", fontWeight: 700, fontSize: 13 }}>
                    <CheckCircle2 size={16} /> Location Verified
                  </div>
                  <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800 }}>
                    {validation.node.label}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    Station: <b>{validation.station.name}</b> • Level: <b>{validation.node.level}</b> • Type: {validation.node.type}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="button"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => router.push(`/navigation?start=${validation.node?.id}`)}
                    >
                      Start Station Navigation From Here <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: "var(--warning-red)", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                    <ShieldAlert size={16} /> Invalid Location Code
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12 }}>{validation.error}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right: Pre-Configured Pilot Station QR Plaques */}
        <section className="card">
          <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>Configured Demo QR Plaques</h2>
          <p className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
            Click any demo wayfinding plaque to instantly simulate scanning a physical location QR tag in <b>Pune Central (Civil Court)</b>:
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            {sampleQrPayloads.map((sample, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.1s",
                }}
                onClick={() => handleValidate(sample.payload)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--primary-text)" }}>
                    📍 {sample.name}
                  </div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {sample.description}
                  </div>
                </div>
                <span className="pill green" style={{ fontSize: 10 }}>Select</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
