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
            {/* <th></th> */}
            <th>Part Name</th>
            <th>Part ID</th>
            <th className="num">Current Stock</th>
            <th className="num">Used for Forecast</th>
            <th className="num">Remaining After Forecast</th>
            <th className="num">Current Value</th>
            <th className="num">Value Used</th>
            <th className="num">Remaining Value</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((p, idx) => {
            const isBottleneck = bottleneckPartIds.includes(p.partId);
            const before = typeof p.beforeStock === 'number' ? p.beforeStock : p.stockBefore;
            const after = typeof p.afterStock === 'number' ? p.afterStock : p.stockAfter;
            const used = (before ?? 0) - (after ?? 0);
            const beforeVal = typeof p.beforeValue === 'number' ? p.beforeValue : undefined;
            const afterVal = typeof p.afterValue === 'number' ? p.afterValue : undefined;
            const usedVal = (typeof beforeVal === 'number' && typeof afterVal === 'number') ? beforeVal - afterVal : undefined;
            // Progress bar for remaining value
            const pct = (typeof afterVal === 'number' && typeof beforeVal === 'number' && beforeVal > 0)
              ? Math.max(0, Math.min(100, (afterVal / beforeVal) * 100)) : 0;
            return (
              <tr
                key={p.partId}
                className={
                  (isBottleneck ? "bottleneck " : "") + (idx % 2 === 1 ? "zebra" : "")
                }
                style={isBottleneck ? { borderLeft: '5px solid #d32f2f', background: '#fff6f6' } : {}}
              >
                {/* <td className="icon">{isBottleneck ? "🔴" : ""}</td> */}
                <td>{p.partName}</td>
                <td>{p.partId}</td>
                <td className="num">{before?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '-'}</td>
                <td className="num" style={{ color: used > 0 ? '#d32f2f' : '#888', fontWeight: 500 }}>
                  {used > 0 ? `${used.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="num">{after?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '-'}</td>
                <td className="num current-value">{typeof beforeVal === 'number' ? `₹${beforeVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}</td>
                <td className="num" style={{ color: usedVal > 0 ? '#d32f2f' : '#888', fontWeight: 600 }}>
                  {usedVal > 0 ? `₹${usedVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="num" style={{ position: 'relative' }}>
                  {typeof afterVal === 'number' ? `₹${afterVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                  {typeof afterVal === 'number' && typeof beforeVal === 'number' && beforeVal > 0 && (
                    <div style={{ position: 'absolute', left: 0, bottom: 2, height: 3, width: '100%', background: '#e0f2f1', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#43a047', borderRadius: 2, opacity: 0.7 }}></div>
                    </div>
                  )}
                </td>
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
