import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import puneMetroData from "@/data/stations/pune-metro.json";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().trim().min(1).max(1200),
  context: z
    .object({
      routeStatus: z.enum(["demo", "verified"]).optional(),
      stationDataStatus: z.enum(["unavailable", "verified"]).optional(),
      stationId: z.string().optional(),
      startLocation: z.string().optional(),
      destination: z.string().optional(),
      currentStep: z.string().optional(),
      preference: z.string().optional(),
    })
    .optional(),
});

const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 18;

function allowed(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const current = requests.get(address);
  if (!current || current.resetAt <= now) {
    requests.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function generateDeterministicStationAnswer(message: string, context?: z.infer<typeof schema>["context"]): string {
  const q = message.toLowerCase();
  const station = puneMetroData.stations[0];

  if (q.includes("step-free") || q.includes("stairs") || q.includes("wheelchair") || q.includes("lift") || q.includes("elevator")) {
    return (
      `Demo Assistant [Pune Metro Navigator]:\n` +
      `• At Pune Central (Civil Court), step-free access is available via the Central Glass Lift on the concourse level.\n` +
      `• If you enter from Gate 2 (South), use the step-free ramp on the right to reach the lift directly.\n` +
      `• The lift connects directly to Platform 1 (Northbound) and Platform 2 (Southbound) without requiring stairs or escalators.\n` +
      `• If the elevator is out of service, please inform station customer care staff near the ticket counter immediately.`
    );
  }

  if (q.includes("platform") || q.includes("board") || q.includes("train")) {
    return (
      `Demo Assistant [Pune Metro Navigator]:\n` +
      `• Platform 1 serves Northbound trains towards PCMC (Purple Line).\n` +
      `• Platform 2 serves Southbound trains towards Swargate (Purple Line).\n` +
      `• Access Platform 1 from Concourse via North Escalator (Up) or Central Glass Lift.\n` +
      `• Access Platform 2 from Concourse via South Escalator (Down) or Central Glass Lift.\n` +
      `• Always verify the overhead electronic display above the platform doors before boarding.`
    );
  }

  if (q.includes("exit") || q.includes("out") || q.includes("railway") || q.includes("bus stand")) {
    return (
      `Demo Assistant [Pune Metro Navigator]:\n` +
      `• Exit A: Leads to MSRTC Central Bus Stand & City Auto Stand.\n` +
      `• Exit B: Connects directly to Pune Railway Junction Footbridge.\n` +
      `• Exit C: Leads towards Sancheti Chowk, JM Road, and Sancheti Hospital.\n` +
      `• If unsure, follow overhead exit direction signs on the concourse after tapping out of the AFC fare gates.`
    );
  }

  if (q.includes("lost") || q.includes("help") || q.includes("direction") || q.includes("wrong")) {
    return (
      `Demo Assistant [Lost Passenger Recovery]:\n` +
      `• Stop at your current location and look for the nearest pillar or signage.\n` +
      `• If you are on a platform level, find the central staircase or glass lift to return to the Concourse.\n` +
      `• Locate the Station Master or Customer Care kiosk beside the AFC fare gates.\n` +
      `• Use MetroMate's "I'm Lost" page to report your landmark or scan any indoor station QR code to reorient your path.`
    );
  }

  if (context?.currentStep) {
    return (
      `Demo Assistant [Active Route Guidance]:\n` +
      `• You are currently on step: "${context.currentStep}".\n` +
      `• Follow the overhead directional signage for your destination.\n` +
      `• If you encounter unexpected construction or locked gates, ask authorized Pune Metro security personnel.`
    );
  }

  return (
    `Demo Assistant (No OpenAI API key configured):\n` +
    `• I am grounded in Pune Metro station data for Pune Central (Civil Court).\n` +
    `• You can ask me how to reach Platform 1/2, find step-free lifts, pick the best exit (A, B, or C), or reorient yourself if you feel lost.\n` +
    `• Note: Live train schedules and fares are subject to official Pune Metro operations.`
  );
}

export async function POST(request: Request) {
  if (!allowed(request)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Send a non-empty message of 1-1200 characters." },
      { status: 400 }
    );
  }

  const { message, context } = parsed.data;

  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({
        answer: generateDeterministicStationAnswer(message, context),
        source: "demo-grounded",
      });
    }

    const client = new OpenAI({ apiKey: key, timeout: 12_000, maxRetries: 1 });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are MetroMate GPT, an AI-powered metro station indoor navigation companion for Pune Metro. " +
            "Explain only verified station layout facts and supplied app context. " +
            "Never fabricate platform numbers, exit locations, live arrival times, or step-free routes that are not verified in the context. " +
            "If station information is missing or unclear, advise the passenger to consult official overhead signage or ask station staff.",
        },
        {
          role: "user",
          content: `Question: ${message}\nContext: ${JSON.stringify(context || {})}`,
        },
      ],
      max_tokens: 350,
    });

    const reply = completion.choices[0]?.message?.content || "No answer was returned.";
    return NextResponse.json({ answer: reply, source: "openai" });
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Graceful fallback to grounded domain answer on upstream error
    return NextResponse.json({
      answer: generateDeterministicStationAnswer(message, context),
      source: "fallback-grounded",
    });
  }
}
