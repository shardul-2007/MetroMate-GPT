"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  HelpCircle,
  Home,
  QrCode,
  Receipt,
  Route,
  Settings,
  Sparkles,
  Train,
} from "lucide-react";

export function AppHeader() {
  return (
    <header className="top-header">
      <div className="top-brand">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="metro-roundel" aria-hidden="true">
            M
          </div>
          <div className="brand-text">
            <span className="brand-title">MetroMate</span>
            <span className="brand-subtitle">Passenger Wayfinding</span>
          </div>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="system-pill">
          <div className="line-dots" aria-hidden="true">
            <span className="line-dot purple" title="Line 1 (PCMC - Swargate)" />
            <span className="line-dot aqua" title="Line 2 (Vanaz - Ramwadi)" />
          </div>
          <span>Pune Metro • Civil Court Hub</span>
        </div>

        <span className="badge demo" style={{ fontSize: 11 }}>
          Pilot Demonstration
        </span>
      </div>
    </header>
  );
}

export function AppNav() {
  const path = usePathname();

  const primaryLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/planner", label: "Plan Journey", icon: Route },
    { href: "/navigation", label: "Station Navigation", icon: Compass, priority: true },
    { href: "/qr", label: "Station QR Scan", icon: QrCode },
    { href: "/lost", label: "Lost Passenger Help", icon: HelpCircle, alert: true },
  ];

  const secondaryLinks = [
    { href: "/expenses", label: "Travel History & Spend", icon: Receipt },
    { href: "/assistant", label: "Station AI Assistant", icon: Sparkles },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Left Navigation Rail */}
      <nav className="nav-rail" aria-label="Main Navigation">
        <span className="nav-section-title">Navigation</span>
        {primaryLinks.map(({ href, label, icon: Icon, priority, alert }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive ? "active" : ""} ${
                priority ? "nav-priority" : ""
              } ${alert ? "nav-help" : ""}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}

        <span className="nav-section-title" style={{ marginTop: 14 }}>
          Tools & Records
        </span>
        {secondaryLinks.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}

        <div style={{ marginTop: "auto", padding: "10px 12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--secondary-text)" }}>
            <Train size={13} color="var(--primary-green)" />
            <span>Pilot Station: Civil Court</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--secondary-text)", marginTop: 2 }}>
            Demonstration Network v0.4
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="bottom-bar" aria-label="Mobile Bottom Navigation">
        <Link href="/" className={`bottom-link ${path === "/" ? "active" : ""}`}>
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link href="/planner" className={`bottom-link ${path === "/planner" ? "active" : ""}`}>
          <Route size={18} />
          <span>Plan</span>
        </Link>
        <Link
          href="/navigation"
          className={`bottom-link ${path === "/navigation" ? "active" : ""}`}
          style={{ fontWeight: 800, color: path === "/navigation" ? "var(--deep-green)" : undefined }}
        >
          <Compass size={19} />
          <span>Navigate</span>
        </Link>
        <Link href="/qr" className={`bottom-link ${path === "/qr" ? "active" : ""}`}>
          <QrCode size={18} />
          <span>QR</span>
        </Link>
        <Link href="/lost" className={`bottom-link ${path === "/lost" ? "active" : ""}`}>
          <HelpCircle size={18} />
          <span>Help</span>
        </Link>
      </nav>
    </>
  );
}
