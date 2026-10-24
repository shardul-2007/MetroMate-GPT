"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus, Receipt, Trash2, ArrowRight, BarChart2 } from "lucide-react";
import { Expense, expensesCsv, getExpenses, money, saveExpenses, total } from "@/lib/data";

const downloadCsv = (contents: string) => {
  const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `metromate-travel-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<Expense["category"]>("Metro");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(getExpenses());
  }, []);

  function addExpense(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim() || !Number.isFinite(value) || value <= 0 || !date) {
      setError("Please provide a journey title, positive fare amount, and date.");
      return;
    }
    const next: Expense[] = [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount: value,
        category,
        date,
        note: note.trim() || undefined,
      },
      ...items,
    ];
    setItems(next);
    saveExpenses(next);
    setTitle("");
    setAmount("");
    setNote("");
    setError("");
  }

  function removeExpense(id: string) {
    if (!confirm("Remove this travel expense entry?")) return;
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    saveExpenses(next);
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <p className="eyebrow">Personal Commute Records</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
          <Receipt size={26} color="var(--primary-green)" />
          <span>Travel History & Expenses</span>
        </h1>

        <Link href="/analytics" className="button secondary" style={{ fontSize: 13, gap: 6 }}>
          <BarChart2 size={15} /> View Spend Insights
        </Link>
      </div>

      <p className="sub">
        Record your daily public transit fares, feeder auto rides, and commute expenses locally in your browser storage.
      </p>

      <div className="two">
        {/* Left: Add Expense Form */}
        <section className="card card-transit-panel">
          <h2 style={{ fontSize: 17, margin: "0 0 12px" }}>Log Travel Fare</h2>
          <form className="form" onSubmit={addExpense}>
            <div className="row">
              <div className="field">
                <label htmlFor="exp-title">Journey / Trip Label</label>
                <input
                  id="exp-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Metro Civil Court to PCMC"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="exp-amount">Fare Amount (INR ₹)</label>
                <input
                  id="exp-amount"
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="exp-date">Date</label>
                <input
                  id="exp-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="exp-mode">Transport Mode</label>
                <select
                  id="exp-mode"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense["category"])}
                >
                  <option value="Metro">Metro Rail</option>
                  <option value="Bus">PMPML Bus</option>
                  <option value="Auto">Feeder Auto Rickshaw</option>
                  <option value="Walk">Walk (Free)</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="exp-note">Optional Travel Note</label>
              <textarea
                id="exp-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Station ticket counter / QR / smart card"
                maxLength={250}
                rows={2}
              />
            </div>

            {error && <p className="notice" style={{ color: "var(--warning-red)", borderColor: "#F8B4B4" }}>{error}</p>}

            <button type="submit" className="button" style={{ gap: 6 }}>
              <Plus size={16} /> Save Travel Record
            </button>
          </form>
        </section>

        {/* Right: Quick Totals & Privacy */}
        <div style={{ display: "grid", gap: 14 }}>
          <section className="card">
            <h2 style={{ fontSize: 16, margin: "0 0 4px" }}>Total Recorded Spend</h2>
            <div className="stat" style={{ fontSize: 32, color: "var(--deep-green)" }}>
              {money(total(items))}
            </div>
            <p className="muted" style={{ margin: "2px 0 0" }}>
              Across {items.length} logged trip{items.length === 1 ? "" : "s"}
            </p>
          </section>

          <section className="card" style={{ background: "var(--surface-alt)" }}>
            <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>Privacy & Storage Notice</h3>
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>
              Travel expense records are stored strictly on your local device using browser local storage. No commute history or spending details are uploaded to MetroMate servers.
            </p>
          </section>
        </div>
      </div>

      {/* Expense History Table */}
      <section className="card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 17, margin: 0 }}>Recorded History</h2>
          <button
            type="button"
            className="button secondary"
            onClick={() => downloadCsv(expensesCsv(items))}
            disabled={!items.length}
            style={{ fontSize: 13, gap: 6 }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {items.length === 0 ? (
          <p className="muted" style={{ margin: "14px 0" }}>
            No transit journeys logged yet. Record your daily commute fares above to monitor your expenses.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trip Destination</th>
                  <th>Mode</th>
                  <th>Fare</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>{x.date}</td>
                    <td><b>{x.title}</b></td>
                    <td><span className="pill">{x.category}</span></td>
                    <td><b>{money(x.amount)}</b></td>
                    <td className="muted" style={{ fontSize: 12 }}>{x.note || "—"}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeExpense(x.id)}
                        className="button outline"
                        style={{ padding: "4px 8px", fontSize: 12, color: "var(--warning-red)" }}
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
