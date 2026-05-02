import React from "react";

export default function HeroSection({ totalUnits, totalDevices, utilizationPct, blockedUnits, valueBefore = 0, valueAfter = 0, valueUsed = 0 }) {
  // Helper to format value in cr/lakh/thousand/rupees
  function formatValue(val) {
    if (val >= 1e7) return (val / 1e7).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' cr';
    if (val >= 1e5) return (val / 1e5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' lakh';
    if (val >= 1e3) return (val / 1e3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' K';
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  const conclusionText = valueUsed > 0
    ? `₹${formatValue(valueUsed)} of inventory was utilized to build the current forecasted quantity. Remaining stock value: ₹${formatValue(valueAfter)}.`
    : "No inventory was utilized in this forecast.";
  return (
    <section className="dashboard-hero">
      <div className="hero-kpis">
        <div className="hero-kpi">
          <div className="hero-kpi-value">{totalUnits}</div>
          <div className="hero-kpi-label">Total Buildable FGs</div>
          <div style={{ fontSize: 15, color: '#555', marginTop: 4 }}>
            {Number.isInteger(totalUnits)
              ? `${totalUnits} finished goods can be delivered with current inventory.`
              : `${Math.floor(totalUnits)} full finished goods can be delivered, and the fractional value (${totalUnits}) indicates a partial build is possible for one more unit.`}
          </div>
        </div>
        <div className="hero-kpi">
          <div className="hero-kpi-value">{totalDevices}</div>
          <div className="hero-kpi-label">Products Supported</div>
        </div>
      </div>
      <div className="hero-financial-summary" style={{ marginTop: 18, marginBottom: 8, textAlign: 'center' }}>
        <span style={{ fontWeight: 600, color: '#1976d2', fontSize: 18 }}>Financial Conclusion:</span>
        <span style={{ display: 'block', marginTop: 6, fontSize: 16, color: '#333' }}>
         Before: <b>₹{formatValue(valueBefore)}</b> &nbsp;| Utilized: <b>₹{formatValue(valueUsed)}</b> &nbsp;|&nbsp; Remaining: <b>₹{formatValue(valueAfter)}</b>
        </span>
        <span style={{ display: 'block', marginTop: 4, fontSize: 15, color: '#555' }}>{conclusionText}</span>
      </div>
      <div className="hero-progress-bar">
        <div className="hero-progress" style={{ width: utilizationPct + "%" }} />
      </div>
    </section>
  );
}
