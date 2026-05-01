import React from "react";
import "./CapacityTable.css";

export default function PartStockTable({ partStockSummary, bottleneckPartIds = [] }) {
  if (!partStockSummary || partStockSummary.length === 0) return null;
  return (
    <table className="capacity-table" style={{ marginTop: 18 }}>
      <thead>
        <tr>
          <th></th>
          <th>Part Name</th>
          <th>Part ID</th>
          <th>Stock Before Forecast</th>
          <th></th>
          <th>Stock After Forecast</th>
          <th>Value Before Forecast</th>
          <th>Value After Forecast</th>
        </tr>
      </thead>
      <tbody>
        {partStockSummary.map((p) => {
          const isBottleneck = bottleneckPartIds.includes(p.partId);
          // Visual bar for before→after stock
          const before = typeof p.beforeStock === 'number' ? p.beforeStock : p.stockBefore;
          const after = typeof p.afterStock === 'number' ? p.afterStock : p.stockAfter;
          const beforeVal = typeof p.valueBefore === 'number' ? p.valueBefore : undefined;
          const afterVal = typeof p.valueAfter === 'number' ? p.valueAfter : undefined;
          const max = Math.max(before || 0, after || 0, 1);
          const beforePct = Math.round(((before || 0) / max) * 100);
          const afterPct = Math.round(((after || 0) / max) * 100);
          return (
            <tr key={p.partId} className={isBottleneck ? "bottleneck" : ""} style={isBottleneck ? { background: "#ffe0e0", fontWeight: 600 } : {}}>
              <td className="icon">{isBottleneck ? "🔴" : ""}</td>
              <td>{p.partName}</td>
              <td>{p.partId}</td>
              <td>{before ?? '-'}</td>
              <td style={{ minWidth: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <div style={{ height: 8, width: 36, background: '#eee', borderRadius: 4, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: 8, width: `${beforePct}%`, background: '#1976d2', borderRadius: 4, opacity: 0.7 }}></div>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: 8, width: `${afterPct}%`, background: '#43a047', borderRadius: 4, opacity: 0.7 }}></div>
                  </div>
                  <span style={{ fontSize: 13, color: '#888' }}>→</span>
                </div>
              </td>
              <td>{after ?? '-'}</td>
              <td>{typeof beforeVal === 'number' ? beforeVal.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '-'}</td>
              <td>{typeof afterVal === 'number' ? afterVal.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
