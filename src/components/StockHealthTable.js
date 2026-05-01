import React from "react";
import "./StockHealthTable.css";

function getHealthStatus(part, minCapacity) {
  if (part.capacity === minCapacity) return "Bottleneck";
  if (part.capacity <= minCapacity * 1.25) return "At Risk";
  return "Healthy";
}

export default function StockHealthTable({ parts, minCapacity }) {
  if (!parts || parts.length === 0) return null;
  return (
    <table className="stock-health-table">
      <thead>
        <tr>
          <th>Part Name</th>
          <th>Capacity (Devices)</th>
          <th>Health Status</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((p) => {
          const status = getHealthStatus(p, minCapacity);
          return (
            <tr key={p.partId} className={status === "Bottleneck" ? "bottleneck" : status === "At Risk" ? "at-risk" : "healthy"}>
              <td>{p.partName}</td>
              <td>{p.capacity}</td>
              <td>{status}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
