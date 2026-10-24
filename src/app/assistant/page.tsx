"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles, Train, Info, RotateCcw } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string; source?: string };

const intro: Msg = {
  role: "assistant",
  text: "Welcome to MetroMate Station Information Assistant. I can clarify wayfinding instructions, check wheelchair elevator accessibility, or help you locate platforms and exits in Pune Metro stations.",
  source: "verified",
};

const suggestions = [
  "How do I reach Platform 1 without using stairs?",
  "Which exit should I take for Pune Railway Station?",
  "What if the concourse escalator is stopped?",
  "Where is the Customer Care counter in Civil Court?",
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const [msgs, setMsgs] = useState<Msg[]>([intro]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setText(q);
    }
  }, [searchParams]);

  async function send(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim() || busy) return;
    const question = text.trim();
    setText("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setBusy(true);

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          context: {
            stationId: "pune-central",
            stationDataStatus: "verified",
            routeStatus: "verified",
          },
        }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: data.answer || data.error || "Information could not be retrieved.",
          source: data.source,
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: "Network error. Please consult official overhead station signage or station staff.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <p className="eyebrow">Passenger Inquiries</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Train size={26} color="var(--primary-green)" />
        <span>Station Wayfinding Assistant</span>
      </h1>
      <p className="sub">
        Ask station questions, verify step-free routes, or request simplified directions. The assistant uses verified Pune Metro station layout data and will never fabricate unknown facts.
      </p>

      {/* Operational Grounding Notice */}
      <div className="notice" style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={16} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>Data Grounding:</b> Answers are constrained to pilot data for <b>Civil Court Interchange</b>. Fares and live train arrival times are governed by official Pune Metro operations.
        </span>
      </div>

      <section className="card card-transit-panel">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="button secondary"
              style={{ fontSize: 12, padding: "6px 10px" }}
              onClick={() => setText(s)}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            className="button outline"
            style={{ fontSize: 12, padding: "6px 10px" }}
            onClick={() => setMsgs([intro])}
          >
            <RotateCcw size={12} /> Clear Inquiries
          </button>
        </div>

        <div className="chat">
          {msgs.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
              {m.source && (
                <div style={{ marginTop: 6, fontSize: 10, opacity: 0.8, textAlign: "right" }}>
                  {m.source === "openai" ? "Powered by OpenAI" : "Grounded Pune Metro Model"}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="message assistant" style={{ fontStyle: "italic", fontSize: 13 }}>
              Checking station layout data...
            </div>
          )}
        </div>

        <form className="form" onSubmit={send} style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1 }}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about elevators, platform transfers, or station exits..."
            maxLength={1200}
            disabled={busy}
          />
          <button className="button" disabled={busy || !text.trim()}>
            <Send size={15} /> Send
          </button>
        </form>
      </section>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="card">Loading Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
