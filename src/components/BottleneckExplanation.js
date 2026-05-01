import React from "react";

export default function BottleneckExplanation({ device, max, bottleneck }) {
  if (!device || !max || !bottleneck) return null;
  return (
    <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16, margin: "24px 0", fontSize: 18, borderLeft: "6px solid #d32f2f" }}>
      Production of <b>{device}</b> is limited to <b>{max}</b> units due to <b>{bottleneck.partName}</b> (ID: {bottleneck.partId}) availability.
    </div>
  );
}
