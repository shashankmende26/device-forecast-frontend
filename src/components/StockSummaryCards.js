import React from "react";
import "./StockSummaryCards.css";

export default function StockSummaryCards({ valueBefore, valueUsed, valueAfter }) {
    console.log("StockSummaryCards props:", { valueBefore, valueUsed, valueAfter });
  return (
    <div className="stock-summary-cards">
      <div className="stock-card">
        <div className="stock-card-label">Total Current Stock Value</div>
        <div className="stock-card-value">{typeof valueBefore === 'number' ? valueBefore.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '-'}</div>
      </div>
      <div className="stock-card">
        <div className="stock-card-label">Total Stock Value Used for Forecast</div>
        <div className="stock-card-value">{typeof valueUsed === 'number' ? valueUsed.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '-'}</div>
      </div>
      <div className="stock-card">
        <div className="stock-card-label">Total Remaining Stock Value After Forecast</div>
        <div className="stock-card-value">{typeof valueAfter === 'number' ? valueAfter.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '-'}</div>
      </div>
    </div>
  );
}
