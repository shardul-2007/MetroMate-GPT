import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({
  message: z.string().trim().min(1).max(1200),
  context: z.object({ routeStatus: z.enum(["demo", "verified"]).optional(), stationDataStatus: z.enum(["unavailable", "verified"]).optional() }).optional(),
});
const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
function allowed(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const current = requests.get(address);
  if (!current || current.resetAt <= now) { requests.set(address, { count: 1, resetAt: now + WINDOW_MS }); return true; }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}
const fallback = (message: string) => `Demo assistant (no OpenAI credential configured): ${message.toLowerCase().includes("station") ? "I don't have verified station-level guidance. Please check official signage or ask station staff." : "Metro + walk is the lowest-cost demo option (INR 42) because it avoids the demo auto first/last-mile cost. These figures are illustrations, not live fares."}`;

export async function POST(request: Request) {
  if (!allowed(request)) return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Send a valid JSON request body." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Send a non-empty message of 1-1200 characters." }, { status: 400 });
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ answer: fallback(parsed.data.message), source: "demo" });
    const client = new OpenAI({ apiKey: key, timeout: 12_000, maxRetries: 1 });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "You are MetroMate. Explain only supplied app context. Clearly label demo data and never fabricate station platforms, exits, accessibility routes, live fares, times, or availability. If verified station guidance is unavailable, tell the rider to check official signs or ask staff.",
      input: `Question: ${parsed.data.message}\nApp context: ${JSON.stringify(parsed.data.context || {})}`,
    });
    return NextResponse.json({ answer: response.output_text || "No answer was returned.", source: "openai" });
  } catch (error) {
    const status = error instanceof OpenAI.APIError && error.status === 429 ? 429 : 502;
    return NextResponse.json({ error: status === 429 ? "The AI service is busy. Please retry shortly." : "The AI service could not complete that request." }, { status });
  }
}