import React from "react";

export default function TopBottlenecksPanel({ bottlenecks }) {
  return (
    <section className="dashboard-card dashboard-bottlenecks">
      <div className="dashboard-section-title">Top Bottlenecks</div>
      <ul className="bottleneck-list">
        {bottlenecks.map(b => (
          <li key={b.partId} className="bottleneck-item">
            <div className="bottleneck-name">{b.partName}</div>
            {/* <div className="bottleneck-impact">{b.unitsBlocked} units blocked</div> */}
            {/* <div className="bottleneck-affected">{b.affectedDevices} devices</div> */}
          </li>
        ))}
      </ul>
    </section>
  );
}
