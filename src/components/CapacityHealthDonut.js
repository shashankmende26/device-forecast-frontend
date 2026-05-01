import React from "react";

export default function CapacityHealthDonut({ parts, minCapacity }) {
  let bottleneck = 0, near = 0, safe = 0;
  for (const p of parts) {
    if (p.capacity === minCapacity) bottleneck++;
    else if (p.capacity <= minCapacity * 1.25) near++;
    else safe++;
  }
  const total = bottleneck + near + safe;
  const percent = (n) => Math.round((n / total) * 100);
  const size = 120, stroke = 22, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const arc = (v) => (v / 100) * c;
  // Angles
  const bPct = percent(bottleneck), nPct = percent(near), sPct = percent(safe);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "24px 0" }}>
      <svg width={size} height={size} style={{ marginBottom: 8 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="#f5f5f5" stroke="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="#d32f2f"
          strokeWidth={stroke}
          strokeDasharray={`${arc(bPct)} ${c - arc(bPct)}`}
          strokeDashoffset={0}
        />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="#fbc02d"
          strokeWidth={stroke}
          strokeDasharray={`${arc(nPct)} ${c - arc(nPct)}`}
          strokeDashoffset={-arc(bPct)}
        />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="#43a047"
          strokeWidth={stroke}
          strokeDasharray={`${arc(sPct)} ${c - arc(sPct)}`}
          strokeDashoffset={-arc(bPct) - arc(nPct)}
        />
      </svg>
      <div style={{ display: "flex", gap: 18 }}>
        <span style={{ color: "#d32f2f", fontWeight: 600 }}>🔴 {bottleneck} Bottleneck</span>
        <span style={{ color: "#fbc02d", fontWeight: 600 }}>🟠 {near} At-Risk</span>
        <span style={{ color: "#43a047", fontWeight: 600 }}>🟢 {safe} Safe</span>
      </div>
    </div>
  );
}
