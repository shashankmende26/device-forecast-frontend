import React from "react";

export default function StockUtilizationPanel({ usedPct, idlePct }) {
  return (
    <section className="dashboard-card dashboard-stock-utilization">
      <div className="dashboard-section-title">Stock Utilization</div>
      <div className="stock-kpis">
        <div className="stock-kpi used">
          <div className="stock-kpi-value">{usedPct}%</div>
          <div className="stock-kpi-label">Inventory Used</div>
        </div>
        <div className="stock-kpi idle">
          <div className="stock-kpi-value">{idlePct}%</div>
          <div className="stock-kpi-label">Idle Stock</div>
        </div>
      </div>
      <div className="stock-insight">Large stock is unused due to bottlenecks</div>
    </section>
  );
}
