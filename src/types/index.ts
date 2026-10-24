export type TransportMode = "Metro" | "Bus" | "Auto" | "Walk";
export type Segment = { mode: TransportMode; from: string; to: string; minutes: number; cost: number; verified: boolean };
export type Journey = { id: string; name: string; cost: number; minutes: number; walkingKm: number; transfers: number; segments: Segment[]; demo: boolean };
export type Expense = { id: string; title: string; category: TransportMode; amount: number; date: string; note?: string };
