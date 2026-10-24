"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart2, Receipt } from "lucide-react";
import { Expense, average, byMode, getExpenses, money, total } from "@/lib/data";

const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 6 + i);
  return d.toISOString().slice(0, 10);
});

export default function Analytics() {
  const [items, setItems] = useState<Expense[]>([]);

  useEffect(() => {
    setItems(getExpenses());
  }, []);

  const groups = byMode(items);
  const daily = days.map((date) => ({
    date,
    value: items.filter((x) => x.date === date).reduce((sum, x) => sum + x.amount, 0),
  }));
  const max = Math.max(1, ...daily.map((x) => x.value));

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Link href="/expenses" className="button outline" style={{ padding: "6px 12px", fontSize: 13, gap: 6 }}>
          <ArrowLeft size={14} /> Back to Travel Expenses
        </Link>
        <span className="badge">Local Device Analytics</span>
      </div>

      <p className="eyebrow">Commute Analytics</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BarChart2 size={28} color="var(--primary-green)" />
        <span>Transit Spending Insights</span>
      </h1>
      <p className="sub">
        Aggregated statistics derived strictly from your locally stored travel records.
      </p>

      {/* Summary KPI Cards */}
      <div className="grid">
        <section className="card card-transit-panel">
          <div className="muted">Total Commute Spending</div>
          <div className="stat" style={{ color: "var(--deep-green)", fontSize: 28 }}>
            {money(total(items))}
          </div>
          <div className="muted">{items.length} journeys logged</div>
        </section>

        <section className="card">
          <div className="muted">Average Recorded Fare</div>
          <div className="stat" style={{ fontSize: 28 }}>
            {money(average(items))}
          </div>
          <div className="muted">Per single journey trip</div>
        </section>

        <section className="card">
          <div className="muted">Active Tracking Period</div>
          <div className="stat" style={{ fontSize: 24 }}>Last 7 Days</div>
          <div className="muted">Local offline window</div>
        </section>
      </div>

      {/* 7-Day Chart */}
      <section className="card" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 17, margin: "0 0 10px" }}>Daily Spending (Last 7 Days)</h2>
        <div
          aria-label="Daily fare totals over the last seven days"
          style={{ display: "flex", height: 160, gap: 10, alignItems: "flex-end", paddingTop: 16, borderBottom: "1px solid var(--border)" }}
        >
          {daily.map((x) => (
            <div
              key={x.date}
              tabIndex={0}
              title={`${x.date}: ${money(x.value)}`}
              style={{ flex: 1, textAlign: "center", fontSize: 11 }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: `${(x.value / max) * 115}px`,
                  minHeight: x.value ? 4 : 0,
                  background: "var(--primary-green)",
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.2s",
                }}
              />
              <span style={{ display: "block", marginTop: 6, fontWeight: 600, color: "var(--secondary-text)" }}>
                {x.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ margin: "10px 0 0", fontSize: 12 }}>
          Hover or focus any daily column bar to inspect the total logged amount.
        </p>
      </section>

      {/* Breakdown by Mode */}
      <section className="card" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 17, margin: "0 0 12px" }}>Spending by Transit Mode</h2>
        {Object.keys(groups).length === 0 ? (
          <p className="muted" style={{ margin: "10px 0" }}>
            Add your daily commute expenses to view categorical breakdown by Metro, Bus, and Auto.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {Object.entries(groups).map(([name, val]) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "var(--surface-alt)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <b>{name}</b>
                <b style={{ color: "var(--deep-green)" }}>{money(val || 0)}</b>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
