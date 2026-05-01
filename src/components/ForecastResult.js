import React from "react";

export default function ForecastResult({ result }) {
  if (!result) return null;
  const { maxDeliverableQuantity, maxFullDevices, bottlenecks, perPartCapacity } = result;
  return (
    <div style={{ marginTop: 32 }}>
      <h2>Forecast Result</h2>
      <div>
        <strong>Max Deliverable Quantity:</strong> {maxDeliverableQuantity}
      </div>
      <div>
        <strong>Max Full Devices:</strong> {maxFullDevices}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Bottleneck Part(s):</strong>
        <ul>
          {bottlenecks.map((b) => (
            <li key={b.partId}>
              {b.partName} (ID: {b.partId}) — Capacity: {b.capacity}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Per-Part Capacity Breakdown:</strong>
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Part ID</th>
              <th>Capacity</th>
              <th>Bottleneck</th>
            </tr>
          </thead>
          <tbody>
            {perPartCapacity.map((p) => (
              <tr key={p.partId} style={p.isBottleneck ? { background: "#ffe0e0" } : {}}>
                <td>{p.partName}</td>
                <td>{p.partId}</td>
                <td>{p.capacity}</td>
                <td>{p.isBottleneck ? "Yes" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
