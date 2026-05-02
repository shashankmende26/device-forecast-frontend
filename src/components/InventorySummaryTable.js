import React, { useState, useMemo, useEffect } from "react";
import "./InventorySummaryTable.css";

export default function InventorySummaryTable({ partStockSummary, bottleneckPartIds = [], page = 1, pageSize = 20, onPageChange }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter by part name or part ID (debounced)
  const filtered = useMemo(() => {
    if (!partStockSummary) return [];
    if (!debouncedSearch.trim()) return partStockSummary;
    const s = debouncedSearch.trim().toLowerCase();
    return partStockSummary.filter(p =>
      (p.partName && p.partName.toLowerCase().includes(s)) ||
      (p.partId && p.partId.toLowerCase().includes(s))
    );
  }, [partStockSummary, debouncedSearch]);


  // If no results, show a friendly message
  const noResults = filtered.length === 0;

  const [currentPage, setCurrentPage] = useState(page);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paged = filtered.slice(start, end);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    if (onPageChange) onPageChange(p);
  };

  return (
    <div className="inventory-summary-table-wrapper">
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="text"
            placeholder="Search by part name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 16, padding: '6px 12px', borderRadius: 6, border: '1.5px solid #bdbdbd', width: 220 }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ marginLeft: 4, fontSize: 15, padding: '4px 10px', borderRadius: 5, border: '1px solid #bdbdbd', background: '#fafafa', cursor: 'pointer' }}>Clear</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="pageSizeSelect" style={{ fontSize: 15, color: '#555' }}>Rows per page:</label>
          <select
            id="pageSizeSelect"
            value={itemsPerPage}
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ fontSize: 15, padding: '4px 8px', borderRadius: 5, border: '1.5px solid #bdbdbd' }}
          >
            {[10, 20, 50, 100].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      {noResults && (
        <div style={{ textAlign: 'center', color: '#888', fontSize: 18, margin: '32px 0' }}>
          No inventory found matching your search.
        </div>
      )}
      {!noResults && (
        <>
          <table className="inventory-summary-table">
            <thead>
              <tr>
                {/* <th></th> */}
                <th>Part Name</th>
                <th>Part ID</th>
                <th>Unit Price</th>
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
                    <td className="num">{typeof p.unitPrice === 'number' ? `₹${p.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}</td>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ fontSize: 15, color: '#555' }}>
                Page {currentPage} of {totalPages} | Showing <b>{filtered.length === 0 ? 0 : start + 1}</b> - <b>{Math.min(end, filtered.length)}</b> of <b>{filtered.length}</b> parts
              </div>
              <div className="table-pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&laquo; First</button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lsaquo; Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next &rsaquo;</button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last &raquo;</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
