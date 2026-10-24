"use client";

import { useEffect, useState } from "react";

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
      <p className="eyebrow">Privacy & Configuration</p>
      <h1 className="title">Settings</h1>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Commute & Wayfinding Preferences</h2>
        <div className="form">
          <div className="row">
            <label className="field">
              Comfortable walking distance
              <select
                value={prefs.walking}
                onChange={(e) => setPrefs({ ...prefs, walking: e.target.value })}
              >
                <option>500 m</option>
                <option>1 km</option>
                <option>2 km</option>
              </select>
            </label>

            <label className="field">
              Target journey budget
              <select
                value={prefs.budget}
                onChange={(e) => setPrefs({ ...prefs, budget: e.target.value })}
              >
                <option>₹50</option>
                <option>₹100</option>
                <option>₹150</option>
              </select>
            </label>
          </div>

          <div className="field">
            <label>Default Station Navigation Preference</label>
            <select
              value={prefs.navigationPreference}
              onChange={(e) => setPrefs({ ...prefs, navigationPreference: e.target.value })}
            >
              <option value="fastest">Fastest Route</option>
              <option value="least-walking">Least Walking</option>
              <option value="step-free">Step-Free (Elevator)</option>
              <option value="fewer-stairs">Fewer Stairs</option>
            </select>
          </div>

          <p className="muted" style={{ margin: "4px 0" }}>
            Currency: INR (₹)
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <button className="button" onClick={save}>
              Save preferences
            </button>
            {saved && <span className="badge">Saved locally ✓</span>}
          </div>
        </div>

        <h2 style={{ marginTop: 28 }}>Data Providers & Verification Status</h2>
        <p style={{ margin: "8px 0" }}>
          <span className="badge">Active Pilot Model</span> Indoor station wayfinding graph is configured for <b>Pune Central (Civil Court)</b>, featuring verified node landmarks, platform connections, and glass elevator step-free accessibility.
        </p>
        <p style={{ margin: "8px 0" }}>
          <span className="badge demo">Demo mode</span> Door-to-door transit comparison fares and walking legs are deterministic illustrations.
        </p>

        <h2 style={{ marginTop: 24 }}>AI Configuration</h2>
        <p className="muted">
          The server checks for a server-side <code>OPENAI_API_KEY</code>. Secret keys are never exposed to browser clients. When no key is configured, the assistant provides a deterministic, grounded fallback based on Pune Metro station data.
        </p>

        <h2 style={{ marginTop: 24 }}>Local Data Storage</h2>
        <p className="muted">
          Expenses and user preferences are retained only in this browser's local storage. MetroMate does not synchronize your personal commute spending to any external server.
        </p>
      </section>
    </div>
  );
}
