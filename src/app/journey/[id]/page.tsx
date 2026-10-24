import Link from "next/link";
import { ArrowLeft, Compass, Footprints, Info, MapPin, Route, Train } from "lucide-react";
import { demoRoutes, money } from "@/lib/data";

export default async function Journey({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const journey = demoRoutes.find((r) => r.id === id);

  if (!journey) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 className="title">Journey Not Found</h1>
        <p className="sub">This demonstration journey itinerary ID is not available in our pilot dataset.</p>
        <Link className="button" href="/planner">
          <ArrowLeft size={16} /> Return to Journey Planner
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Link href="/planner" className="button outline" style={{ padding: "6px 12px", fontSize: 13, gap: 6 }}>
          <ArrowLeft size={14} /> Back to Planner
        </Link>
        <span className="badge demo">Demonstration Itinerary</span>
      </div>

      <p className="eyebrow">Trip Details</p>
      <h1 className="title">{journey.name}</h1>
      <p className="sub">{journey.detail}</p>

      {/* Notice */}
      <div className="notice" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <Info size={18} color="#634707" style={{ flexShrink: 0 }} />
        <span>
          <b>Illustrative Itinerary:</b> This city route combines estimated transit legs for comparison. When you arrive at the metro station, use MetroMate's <b>Station Navigation</b> for turn-by-turn indoor wayfinding.
        </span>
      </div>

      <section className="card card-transit-panel">
        <h2 style={{ fontSize: 17, margin: "0 0 12px" }}>Itinerary Summary</h2>
        <div className="grid">
          <div>
            <div className="stat">{money(journey.cost)}</div>
            <div className="muted">Total Estimated Cost</div>
          </div>
          <div>
            <div className="stat">{journey.duration} min</div>
            <div className="muted">Total Duration</div>
          </div>
          <div>
            <div className="stat">{journey.walking} km</div>
            <div className="muted">Walking Distance</div>
          </div>
        </div>

        <h3 style={{ fontSize: 15, margin: "18px 0 10px" }}>Sequential Transit Segments</h3>
        <div className="timeline">
          <div className="step-card">
            <div className="number">1</div>
            <div>
              <b>First-Mile Pedestrian Connection</b>
              <p className="muted" style={{ margin: "3px 0 0" }}>
                Walk to the nearest station entrance gate ({journey.walking > 1 ? "approx. 400m" : "approx. 200m"}).
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="number">2</div>
            <div>
              <b>Pune Metro Rail Transit</b>
              <p className="muted" style={{ margin: "3px 0 0" }}>
                Board Pune Metro train. Number of transit interchange transfers: <b>{journey.transfers}</b>.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="number">3</div>
            <div>
              <b>Last-Mile Walking / Connection</b>
              <p className="muted" style={{ margin: "3px 0 0" }}>
                Exit the destination station through the recommended exit gate and walk to your final destination point.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Link href="/navigation" className="button" style={{ gap: 8 }}>
            <Compass size={16} /> Open Station Indoor Navigator
          </Link>
          <Link href="/planner" className="button secondary">
            Compare Other Routes
          </Link>
        </div>
      </section>
    </div>
  );
}
