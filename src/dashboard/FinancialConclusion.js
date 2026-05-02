import React from "react";

export default function FinancialConclusion({ valueBefore, valueAfter, valueUsed }) {
  return (
    <section className="dashboard-card dashboard-financial-conclusion">
      <div className="dashboard-section-title">Financial Conclusion</div>
      <div className="financial-kpis">
        <div className="financial-kpi before">
          <div className="financial-kpi-value">₹{valueBefore.toLocaleString()}</div>
          <div className="financial-kpi-label">Inventory Value Before</div>
        </div>
        <div className="financial-kpi used">
          <div className="financial-kpi-value">₹{valueUsed.toLocaleString()}</div>
          <div className="financial-kpi-label">Value Utilized</div>
        </div>
        <div className="financial-kpi after">
          <div className="financial-kpi-value">₹{valueAfter.toLocaleString()}</div>
          <div className="financial-kpi-label">Inventory Value After</div>
        </div>
      </div>
      <div className="financial-insight">
        {valueUsed > 0
          ? `₹${valueUsed.toLocaleString()} of inventory was utilized to build the current forecasted quantity. Remaining stock value: ₹${valueAfter.toLocaleString()}.`
          : "No inventory was utilized in this forecast."}
      </div>
    </section>
  );
}
