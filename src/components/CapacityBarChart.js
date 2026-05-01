import React from "react";

function getStatus(capacity, minCapacity) {
  if (capacity === minCapacity) return "bottleneck";
  if (capacity <= minCapacity * 1.25) return "near";
  return "safe";
}

const COLORS = {
  bottleneck: "#d32f2f",
  near: "#fbc02d",
  safe: "#43a047"
};

export default function CapacityBarChart({ parts, minCapacity }) {
  const sorted = [...parts].sort((a, b) => a.capacity - b.capacity);
  return (
    <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
      {sorted.map((p) => {
        const status = getStatus(p.capacity, minCapacity);
        return (
          <div key={p.partId} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 160, fontWeight: 500, color: status === "bottleneck" ? COLORS.bottleneck : "#222" }}>{p.partName}</div>
            <div style={{ flex: 1, margin: "0 12px" }}>
              <div style={{ background: "#eee", borderRadius: 6, height: 18, position: "relative" }}>
                <div style={{
                  background: COLORS[status],
                  borderRadius: 6,
                  height: "100%",
                  width: `${Math.min(100, (p.capacity / (minCapacity * 2)) * 100)}%`,
                  transition: "width 0.3s"
                }} />
                <div style={{ position: "absolute", left: 8, top: 0, fontSize: 13, color: "#fff", fontWeight: 600 }}>{p.capacity}</div>
              </div>
            </div>
            <div style={{ width: 32, textAlign: "center", fontSize: 18 }}>
              {status === "bottleneck" && "🔴"}
              {status === "near" && "🟠"}
              {status === "safe" && "🟢"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
