"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Send, Sparkles, Compass, AlertCircle, RotateCcw } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string; source?: string };

const intro: Msg = {
  role: "assistant",
  text: "Hello! I am your MetroMate navigation companion. Ask me anything about navigating inside Pune Metro stations — including reaching platforms, step-free elevator routes, finding the best exit, or what to do if you feel disoriented.",
  source: "verified",
};

const suggestions = [
  "How do I reach Platform 1 without stairs?",
  "Which exit should I take for Pune Railway Station?",
  "I cannot find the escalator. What should I do?",
  "What is the step-free path from Gate 2?",
  "I'm lost near the AFC gates. Where is customer care?",
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
          text: data.answer || data.error || "I could not answer that.",
          source: data.source,
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: "Network error. Please try again or consult official station signage.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <p className="eyebrow">Station-Aware AI Companion</p>
      <h1 className="title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Bot size={32} color="#6950d5" />
        MetroMate AI Assistant
      </h1>
      <p className="sub">
        Ask station wayfinding questions, verify elevator access, or request simplified step-by-step directions. The assistant uses verified Pune Metro station layout data and will never fabricate unknown facts.
      </p>

      <section className="card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              className="button secondary"
              style={{ fontSize: 12, padding: "7px 11px" }}
              onClick={() => {
                setText(s);
              }}
            >
              <Sparkles size={13} /> {s}
            </button>
          ))}
          <button
            className="button outline"
            style={{ fontSize: 12, padding: "7px 11px" }}
            onClick={() => setMsgs([intro])}
          >
            <RotateCcw size={13} /> Clear Chat
          </button>
        </div>

        <div className="chat">
          {msgs.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
              {m.source && (
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8, textAlign: "right" }}>
                  {m.source === "openai" ? "Powered by OpenAI" : "Grounded Pune Metro Data"}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="message assistant" style={{ fontStyle: "italic", display: "flex", gap: 6, alignItems: "center" }}>
              <Bot size={16} /> Thinking with station data...
            </div>
          )}
        </div>

        <form className="form" onSubmit={send} style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <input
            style={{ flex: 1 }}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask where to walk, how to avoid stairs, or which exit to take..."
            maxLength={1200}
            disabled={busy}
          />
          <button className="button" disabled={busy || !text.trim()}>
            <Send size={16} /> Send
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
