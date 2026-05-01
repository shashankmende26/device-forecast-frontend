import React from "react";
import "./InventorySummaryTable.css";

export default function InventorySummaryTable({ partStockSummary, bottleneckPartIds = [], page = 1, pageSize = 20, onPageChange }) {
  if (!partStockSummary || partStockSummary.length === 0) return null;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = partStockSummary.slice(start, end);
  const totalPages = Math.ceil(partStockSummary.length / pageSize);

  return (
    <div className="inventory-summary-table-wrapper">
      <table className="inventory-summary-table">
        <thead>
          <tr>
            <th></th>
            <th>Part Name</th>
            <th>Part ID</th>
            <th>Current Stock</th>
            <th>Used for Forecast</th>
            <th>Remaining After Forecast</th>
            <th>Current Value (INR)</th>
            <th>Value Used (INR)</th>
            <th>Remaining Value (INR)</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((p) => {
            const isBottleneck = bottleneckPartIds.includes(p.partId);
            const before = typeof p.beforeStock === 'number' ? p.beforeStock : p.stockBefore;
            const after = typeof p.afterStock === 'number' ? p.afterStock : p.stockAfter;
            const used = (before ?? 0) - (after ?? 0);
            const beforeVal = typeof p.beforeValue === 'number' ? p.beforeValue : undefined;
            const afterVal = typeof p.afterValue === 'number' ? p.afterValue : undefined;
            const usedVal = (typeof beforeVal === 'number' && typeof afterVal === 'number') ? beforeVal - afterVal : undefined;
            return (
              <tr key={p.partId} className={isBottleneck ? "bottleneck" : ""}>
                <td className="icon">{isBottleneck ? "🔴" : ""}</td>
                <td>{p.partName}</td>
                <td>{p.partId}</td>
                <td>{before?.toFixed(2) ?? '-'}</td>
                <td>{used?.toFixed(2) ?? '-'}</td>
                <td>{after?.toFixed(2) ?? '-'}</td>
                <td>{typeof beforeVal === 'number' ? beforeVal.toFixed(2).toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '-'}</td>
                <td>{typeof usedVal === 'number' ? usedVal.toFixed(2).toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '-'}</td>
                <td>{typeof afterVal === 'number' ? afterVal.toFixed(2).toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="table-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={page === i + 1 ? "active" : ""}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
