"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownUp, ArrowRight, Compass, Info, MapPin, Route, Train } from "lucide-react";
import { demoRoutes, money, rankRoutes, type Preference } from "@/lib/data";

export default function Planner() {
  const [origin, setOrigin] = useState("Vanaz (Line 2)");
  const [destination, setDestination] = useState("Civil Court (Interchange)");
  const [preference, setPreference] = useState<Preference>("balanced");
  const [maxWalking, setMaxWalking] = useState("1 km");
  const [shown, setShown] = useState(false);

  const routes = rankRoutes(demoRoutes, preference);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <p className="eyebrow">City Transit Journey Planner</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Route size={28} color="var(--primary-green)" />
        <span>Plan Multimodal Journey</span>
      </h1>
      <p className="sub">
        Compare door-to-door transit options across Pune including Metro connections, first/last-mile auto rickshaws, and walking transfers.
      </p>

      {/* Operational Disclaimer */}
      <div className="notice" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>Demonstration Routing:</b> City-level trip itineraries and fares are deterministic demo options to illustrate multi-modal trade-offs. For live train timings, consult official Pune Metro stations.
        </span>
      </div>

      <section className="card card-transit-panel">
        <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>Journey Query</h2>
        <div className="form">
          <div className="row">
            <div className="field">
              <label htmlFor="planner-origin" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={15} color="#059669" />
                <span>Origin Station or Location</span>
              </label>
              <input
                id="planner-origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Vanaz, Swargate, or PCMC"
                required
              />
            </div>

            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="planner-dest" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={15} color="#147D5A" />
                  <span>Destination Station or Location</span>
                </label>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="button outline"
                  style={{ padding: "2px 8px", fontSize: 11, height: 22, gap: 4 }}
                >
                  <ArrowDownUp size={11} /> Swap
                </button>
              </div>
              <input
                id="planner-dest"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Civil Court, Ramwadi, or Pune Rly Stn"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="planner-rank">Sort Journeys By</label>
              <select
                id="planner-rank"
                value={preference}
                onChange={(e) => setPreference(e.target.value as Preference)}
              >
                <option value="balanced">Balanced (Cost + Time + Walking)</option>
                <option value="cheapest">Cheapest Fare</option>
                <option value="fastest">Fastest Travel Time</option>
                <option value="least-walking">Least Walking Distance</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="planner-maxwalk">Maximum Comfortable Walking</label>
              <select
                id="planner-maxwalk"
                value={maxWalking}
                onChange={(e) => setMaxWalking(e.target.value)}
              >
                <option value="500 m">Up to 500 meters</option>
                <option value="1 km">Up to 1 kilometer</option>
                <option value="2 km">Up to 2 kilometers</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Currency: INR (₹)
            </span>
            <button
              type="button"
              className="button"
              onClick={() => setShown(true)}
              style={{ padding: "10px 22px" }}
            >
              Compare Journey Options <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {shown && (
        <section style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Available Route Itineraries</h2>
            <span className="badge demo">Demonstration Itineraries</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {routes.map((r, i) => (
              <article key={r.id} className="card" style={{ borderLeft: i === 0 ? "4px solid var(--primary-green)" : "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {i === 0 && <span className="pill green">Recommended</span>}
                    <h3 style={{ margin: 0, fontSize: 17 }}>{r.name}</h3>
                  </div>
                  <span className="pill">{r.transfers === 0 ? "Direct line" : `${r.transfers} transit transfer`}</span>
                </div>

                <div className="grid" style={{ margin: "14px 0 10px" }}>
                  <div>
                    <div className="stat" style={{ fontSize: 22 }}>{money(r.cost)}</div>
                    <div className="muted">Estimated Fare</div>
                  </div>
                  <div>
                    <div className="stat" style={{ fontSize: 22 }}>{r.duration} min</div>
                    <div className="muted">Total Travel Time</div>
                  </div>
                  <div>
                    <div className="stat" style={{ fontSize: 22 }}>{r.walking} km</div>
                    <div className="muted">Walking Segment</div>
                  </div>
                </div>

                <p className="muted" style={{ fontSize: 12, margin: "6px 0 12px" }}>
                  {r.detail}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <Link className="button secondary" href={`/journey/${r.id}`} style={{ fontSize: 13 }}>
                    View Step Breakdown →
                  </Link>
                  <Link className="button outline" href="/navigation" style={{ fontSize: 13, gap: 6 }}>
                    <Compass size={14} color="var(--primary-green)" /> Station Indoor Guide
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
