"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, Settings as SettingsIcon, Train } from "lucide-react";

type Preferences = {
  walking: string;
  budget: string;
  navigationPreference: string;
};

const key = "metromate-preferences";

export default function Settings() {
  const [prefs, setPrefs] = useState<Preferences>({
    walking: "1 km",
    budget: "₹100",
    navigationPreference: "fastest",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  function save() {
    localStorage.setItem(key, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <p className="eyebrow">Application Configuration</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SettingsIcon size={26} color="var(--primary-green)" />
        <span>Settings & Preferences</span>
      </h1>
      <p className="sub">
        Customize default walking tolerance, routing preferences, and review data sources.
      </p>

      <section className="card card-transit-panel" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>Commute & Navigation Defaults</h2>
        <div className="form">
          <div className="row">
            <div className="field">
              <label htmlFor="pref-walk">Maximum Walking Distance</label>
              <select
                id="pref-walk"
                value={prefs.walking}
                onChange={(e) => setPrefs({ ...prefs, walking: e.target.value })}
              >
                <option value="500 m">500 meters (Light walking)</option>
                <option value="1 km">1 kilometer (Standard)</option>
                <option value="2 km">2 kilometers (Active walking)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="pref-budget">Target Daily Transit Budget</label>
              <select
                id="pref-budget"
                value={prefs.budget}
                onChange={(e) => setPrefs({ ...prefs, budget: e.target.value })}
              >
                <option value="₹50">₹50 / day</option>
                <option value="₹100">₹100 / day</option>
                <option value="₹150">₹150 / day</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="pref-route">Default Station Wayfinding Routing</label>
            <select
              id="pref-route"
              value={prefs.navigationPreference}
              onChange={(e) => setPrefs({ ...prefs, navigationPreference: e.target.value })}
            >
              <option value="fastest">Fastest Route (Use Escalators)</option>
              <option value="least-walking">Least Walking Distance</option>
              <option value="step-free">Step-Free Accessible (Elevator / Ramp Only)</option>
              <option value="fewer-stairs">Fewer Stairs (Avoid Staircases)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button type="button" className="button" onClick={save}>
              Save Preferences
            </button>
            {saved && (
              <span className="badge verified" style={{ gap: 4 }}>
                <CheckCircle2 size={13} /> Saved locally
              </span>
            )}
          </div>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 17 }}>Transit Data Source & Verification</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <div style={{ padding: "10px 12px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge verified">Pilot Station Graph</span>
              <b>Pune Central (Civil Court Interchange)</b>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              Calibrated indoor wayfinding nodes and edges including Entrances, Fare Gates, Glass Elevators, Escalators, Platforms 1 & 2, and Exits A, B, C.
            </p>
          </div>

          <div style={{ padding: "10px 12px", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge demo">Demonstration Model</span>
              <b>Citywide Multi-Modal Transit</b>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              Door-to-door transit times and multimodal cost comparisons are deterministic demo estimates.
            </p>
          </div>
        </div>

        <h2 style={{ marginTop: 24, fontSize: 17 }}>AI Service Configuration</h2>
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          Server-side API keys are protected and never sent to browser clients. In offline or unconfigured environments, the Station Assistant falls back to deterministic, grounded Pune Metro wayfinding facts.
        </p>

        <h2 style={{ marginTop: 24, fontSize: 17 }}>Device Privacy</h2>
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          Expenses, preferences, and journey progress are retained exclusively inside browser <code>localStorage</code> on this device.
        </p>
      </section>
    </div>
  );
}
