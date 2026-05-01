import React from "react";
import "./CapacityTable.css";

function getStatus(capacity, minCapacity) {
  if (capacity === minCapacity) return "bottleneck";
  if (capacity <= minCapacity * 1.25) return "near";
  return "safe";
}

export default function CapacityTable({ parts, minCapacity }) {
  const sorted = [...parts].sort((a, b) => a.capacity - b.capacity);
  return (
    <table className="capacity-table">
      <thead>
        <tr>
          <th></th>
          <th>Part Name</th>
          <th>Part ID</th>
          <th>Capacity</th>
          <th>Bottleneck</th>
          <th>Health</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((p) => {
          const status = getStatus(p.capacity, minCapacity);
          return (
            <tr key={p.partId} className={status}>
              <td className="icon">
                {status === "bottleneck" && "🔴"}
                {status === "near" && "🟠"}
                {status === "safe" && "🟢"}
              </td>
              <td>{p.partName}</td>
              <td>{p.partId}</td>
              <td>{p.capacity}</td>
              <td>{p.isBottleneck ? "Yes" : ""}</td>
              <td>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${Math.min(100, (p.capacity / (minCapacity * 2)) * 100)}%` }}></div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
