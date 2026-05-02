import React, { useState, useMemo } from "react";

/**
 * SimulationPanel allows users to adjust the available stock of the bottleneck part
 * and see the impact on production, using only in-memory data and the forecast API.
 *
 * Props:
 * - forecast: the latest forecast result (from backend)
 * - deviceCode: the selected device code
 * - onSimulate: async function (deviceCode, simulatedInventory) => forecastResult
 *   (should call backend with simulated inventory, but not mutate original)
 */
export default function SimulationPanel({ forecast, deviceCode, onSimulate }) {
  const bottlenecks = forecast?.bottlenecks || [];
  const [selectedBottleneckId, setSelectedBottleneckId] = useState(bottlenecks[0]?.partId || "");
  const [simStock, setSimStock] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset simulator when device or forecast changes
  React.useEffect(() => {
    setSelectedBottleneckId(bottlenecks[0]?.partId || "");
    setSimStock(null);
    setSimResult(null);
  }, [deviceCode, forecast]);

  // Find selected bottleneck and part
  const selectedBottleneck = bottlenecks.find(b => b.partId === selectedBottleneckId) || bottlenecks[0];
  const bottleneckPart = useMemo(() => {
    if (!selectedBottleneck || !forecast?.partStockSummary) return null;
    return forecast.partStockSummary.find(p => p.partId === selectedBottleneck.partId);
  }, [selectedBottleneck, forecast]);

  // Used for forecast: beforeStock - afterStock
  const bottleNeckStockUsedForForecast = forecast?.partStockSummary?.find(p => p.partId === selectedBottleneck?.partId);
  const usedForForecast = bottleNeckStockUsedForForecast ? (bottleNeckStockUsedForForecast.beforeStock - bottleNeckStockUsedForForecast.afterStock) : 0;
  const minStock = usedForForecast;
  // Maximum is double the before stock or +100, whichever is higher
  const maxStock = Math.max(
    minStock,
    (bottleneckPart?.beforeStock ?? bottleneckPart?.stockBefore ?? minStock) * 2,
    minStock + 100
  );

  // On slider change, simulate
  async function handleSimChange(e) {
    const newStock = Number(e.target.value);
    setSimStock(newStock);
    setLoading(true);
    try {
      const simInv = forecast.partStockSummary.map(p =>
        p.partId === bottleneckPart.partId
          ? { ...p, afterStock: newStock, stockAfter: newStock }
          : { ...p }
      );
      // Call parent-provided simulation handler
      const result = await onSimulate(deviceCode, simInv);
      setSimResult(result);
    } finally {
      setLoading(false);
    }
  }

  // Handle bottleneck selection
  function handleBottleneckSelect(e) {
    setSelectedBottleneckId(e.target.value);
    setSimStock(null);
    setSimResult(null);
  }

  // Initial value for simStock
  React.useEffect(() => {
    if (minStock && simStock === null) setSimStock(minStock);
  }, [minStock, simStock, selectedBottleneckId]);

  if (!selectedBottleneck || !bottleneckPart) return null;

  const currentProduction = forecast.maxDeliverableQuantity;
  const simulatedProduction = simResult?.maxDeliverableQuantity ?? currentProduction;
  const delta = simulatedProduction - currentProduction;

  // Estimated cost calculation
  // Only for the difference between simulated and stock used for forecast
  const unitPrice = bottleneckPart?.unitPrice ?? 0;
  const additionalStock = (simStock ?? minStock) - minStock;
  const estimatedCost = additionalStock > 0 ? additionalStock * unitPrice : 0;

  return (
    <div style={{ background: '#f3e5f5', border: '1.5px solid #ce93d8', borderRadius: 10, padding: '22px 32px', margin: '0 0 18px 0', fontSize: 18, fontWeight: 500, color: '#6a1b9a', boxShadow: '0 2px 12px rgba(186, 104, 200, 0.07)' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>🎛️ SIMULATION (What-if Analysis)</div>
      {bottlenecks.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="bottleneck-select" style={{ fontSize: 16, color: '#333', marginRight: 8 }}>Select Bottleneck:</label>
          <select id="bottleneck-select" value={selectedBottleneckId} onChange={handleBottleneckSelect} style={{ fontSize: 16, padding: '2px 8px', borderRadius: 6, border: '1.5px solid #bdbdbd' }}>
            {bottlenecks.map(b => (
              <option key={b.partId} value={b.partId}>{b.partName}</option>
            ))}
          </select>
        </div>
      )}
      <div style={{ marginBottom: 10 }}>
        Adjust <b>{selectedBottleneck.partName}</b> availability (Stock Used <b>{minStock}</b> units)
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span>{minStock}</span>
        <input
          type="range"
          min={minStock}
          max={maxStock}
          value={simStock ?? minStock}
          onChange={handleSimChange}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <span>{maxStock}</span>
        <input
          type="number"
          min={minStock}
          max={maxStock}
          value={simStock ?? minStock}
          onChange={e => handleSimChange({ target: { value: e.target.value } })}
          style={{ width: 80, marginLeft: 18, fontSize: 16, padding: '2px 8px', borderRadius: 6, border: '1.5px solid #bdbdbd' }}
          disabled={loading}
        />
        <span style={{ fontSize: 16, color: '#333' }}>Simulated Stock</span>
      </div>
      <div>New Stock: <b>{additionalStock > 0 ? additionalStock : 0}</b> (to procure for gain)</div>
      <div>New Production: <b>{simulatedProduction}</b> units</div>
      <div>Production Gain: <b>{delta >= 0 ? "+" : ""}{delta}</b> units</div>
      {estimatedCost > 0 && delta > 0 && (
        <div style={{ marginTop: 8, color: '#388e3c', fontWeight: 600 }}>
          Estimated Cost to Achieve: <b>₹{estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>
        </div>
      )}
      {loading && (
        <div style={{ color: '#888', fontSize: 15, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="lds-dual-ring" style={{ display: 'inline-block', width: 20, height: 20, verticalAlign: 'middle' }}></span>
          Simulating...
        </div>
      )}
      {/* Spinner CSS */}
      <style>{`
        .lds-dual-ring {
          display: inline-block;
          width: 20px;
          height: 20px;
        }
        .lds-dual-ring:after {
          content: " ";
          display: block;
          width: 16px;
          height: 16px;
          margin: 2px;
          border-radius: 50%;
          border: 2px solid #1976d2;
          border-color: #1976d2 transparent #1976d2 transparent;
          animation: lds-dual-ring 1s linear infinite;
        }
        @keyframes lds-dual-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
        Slider limits: {minStock} (stock used for forecast) to {maxStock} (max simulation)
      </div>
    </div>
  );
}
