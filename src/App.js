import React, { useState } from "react";


import ExcelUpload from "./components/ExcelUpload";
import DeviceSelector from "./components/DeviceSelector";
import KPITiles from "./components/KPITiles";
import BottleneckExplanation from "./components/BottleneckExplanation";
import CapacityTable from "./components/CapacityTable";
import InventorySummaryTable from "./components/InventorySummaryTable";
import StockHealthTable from "./components/StockHealthTable";
import StockSummaryCards from "./components/StockSummaryCards";
import TabLayout from "./components/TabLayout";
import SimulationPanel from "./components/SimulationPanel";
import ControlBar from "./components/ControlBar";
import ViewToggle from "./components/ViewToggle";
import CapacityBarChart from "./components/CapacityBarChart";
import CapacityHealthDonut from "./components/CapacityHealthDonut";
import { fetchDeviceTypes, requestForecast } from "./api";

// Simulation handler: clone inventory, call forecast API with simulated inventory
async function handleSimulate(deviceCode, simulatedInventory) {
  // Call backend forecast API with simulated inventory (in-memory, no mutation)
  // This assumes the backend can accept a simulated inventory for what-if analysis
  // If not, fallback to current forecast (no-op)
  try {
    const res = await fetch("/api/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceCode, simulatedInventory }),
    });
    const data = await res.json();
    return data.forecast;
  } catch {
    return null;
  }
}

export default function App() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("table");

  async function handleUploadSuccess(types) {
    setDeviceTypes(types);
    setSelectedDevice("");
    setForecast(null);
    setError("");
  }

  async function handleDeviceSelect(device) {
    setSelectedDevice(device);
    setForecast(null);
    setError("");
  }

  async function handleForecast() {
    setLoading(true);
    setError("");
    try {
      const res = await requestForecast(selectedDevice);
      setForecast(res.forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Dashboard layout
  const primaryBottleneck = forecast?.bottlenecks?.[0] || null;
  const bottleneckCount = forecast?.bottlenecks?.length || 0;
  // Pagination state for inventory summary
  const [invPage, setInvPage] = useState(1);
  const pageSize = 20;

  // Aggregation for inventory summary (INR only)
  const agg = React.useMemo(() => {
    if (!forecast?.partStockSummary) return null;
    let valueBefore = 0, valueAfter = 0, valueUsed = 0;
    forecast.partStockSummary.forEach(p => {
      const beforeVal = typeof p.valueBefore === 'number' ? p.valueBefore : 0;
      const afterVal = typeof p.valueAfter === 'number' ? p.valueAfter : 0;
      const usedVal = beforeVal - afterVal;
      valueBefore += beforeVal;
      valueAfter += afterVal;
      valueUsed += usedVal;
    });
    return { valueBefore, valueAfter, valueUsed };
  }, [forecast]);

  // Helper: get bottleneck part details
  const bottleneck = primaryBottleneck;
  const maxUnits = forecast?.maxDeliverableQuantity || 0;
  const idealUnits = forecast?.idealQuantity || forecast?.maxPossibleQuantity || 0;
  const bottleneckName = bottleneck?.partName || "-";
  const bottleneckId = bottleneck?.partId || "-";
  const bottleneckRequired = bottleneck?.requiredQuantity || bottleneck?.required || 0;
  const bottleneckAvailable = bottleneck?.availableQuantity || bottleneck?.available || 0;
  const bottleneckPct = bottleneckRequired > 0 ? Math.round((bottleneckAvailable / bottleneckRequired) * 100) : 0;
  const lostUnits = (idealUnits && maxUnits) ? (idealUnits - maxUnits) : 0;
  // Financials
  const valueBefore = forecast?.overallValueBefore || 0;
  const valueAfter = forecast?.overallValueAfter || 0;
  const valueUsed = valueBefore - valueAfter;
  // Stock health summary
  const healthCounts = React.useMemo(() => {
    if (!forecast?.perPartCapacity) return { healthy: 0, low: 0, critical: 0 };
    let healthy = 0, low = 0, critical = 0;
    const minCap = forecast.maxDeliverableQuantity;
    forecast.perPartCapacity.forEach(p => {
      if (p.capacity === minCap) critical++;
      else if (p.capacity <= minCap * 1.25) low++;
      else healthy++;
    });
    return { healthy, low, critical };
  }, [forecast]);

  return (
    <div style={{ padding: 10, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER SECTION */}
      <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 18, letterSpacing: -1, color: "#1976d2" }}>Device Forecast</div>
      <ControlBar>
        <div className="filter-group">
          <ExcelUpload onUploadSuccess={handleUploadSuccess} />
          {deviceTypes.length > 0 && (
            <DeviceSelector deviceTypes={deviceTypes} selected={selectedDevice} onSelect={handleDeviceSelect} />
          )}
        </div>
        <div className="action-group">
          {selectedDevice && (
            <button className="primary-action" onClick={handleForecast} disabled={loading}>
              {loading ? "Forecasting..." : "Get Forecast"}
            </button>
          )}
        </div>
      </ControlBar>
      {error && <div style={{ color: "#d32f2f", margin: "12px 0 0 0", fontWeight: 500, fontSize: 17 }}>{error}</div>}

      {/* PRODUCTION LIMIT ALERT */}
      {forecast && maxUnits > 0 && bottleneck && (
        <div style={{
          background: '#fffbe6',
          border: '1.5px solid #ffe082',
          borderRadius: 10,
          padding: '22px 32px',
          margin: '28px 0 18px 0',
          fontSize: 22,
          fontWeight: 600,
          color: '#b26a00',
          boxShadow: '0 2px 12px rgba(255, 193, 7, 0.07)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🚨 PRODUCTION LIMITED</div>
          <div style={{ marginBottom: 8 }}>You can produce only: <span style={{ color: '#d32f2f', fontWeight: 700 }}>{maxUnits} units</span></div>
          <div style={{ marginBottom: 18 }}>Due to shortage of: <span style={{ color: '#1976d2', fontWeight: 700 }}>{bottleneckName} ({bottleneckId})</span></div>
        </div>
      )}

      {/* PRODUCTION CAPACITY VISUAL */}
      {forecast && maxUnits > 0 && idealUnits > 0 && (
        <div style={{
          background: '#f5faff',
          border: '1.5px solid #b3e5fc',
          borderRadius: 10,
          padding: '22px 32px',
          margin: '0 0 18px 0',
          fontSize: 20,
          fontWeight: 500,
          color: '#1976d2',
          boxShadow: '0 2px 12px rgba(33, 150, 243, 0.07)'
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>PRODUCTION CAPACITY</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{maxUnits} / {idealUnits} Units</div>
          <div style={{ width: '100%', height: 22, background: '#e3f2fd', borderRadius: 8, overflow: 'hidden', margin: '12px 0 8px 0', position: 'relative' }}>
            <div style={{ width: `${(maxUnits / idealUnits) * 100}%`, height: '100%', background: '#1976d2', borderRadius: 8, transition: 'width 0.3s' }}></div>
          </div>
          <div style={{ color: '#b26a00', fontWeight: 600, fontSize: 17, marginTop: 4 }}>⚠️ Lost Capacity: {lostUnits} Units</div>
        </div>
      )}

      {/* BOTTLENECK & FINANCIAL IMPACT PANEL */}
      {forecast && bottleneck && (
        <div style={{ display: 'flex', gap: 24, margin: '0 0 18px 0' }}>
          {/* Left: Bottleneck Details */}
          <div style={{ flex: 1, background: '#fff6f6', border: '1.5px solid #ffcdd2', borderRadius: 10, padding: '22px 24px', minWidth: 320 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#d32f2f', marginBottom: 8 }}>🔴 BOTTLENECK</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{bottleneckName}</div>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>ID: {bottleneckId}</div>
            {/* <div style={{ fontSize: 16, marginBottom: 4 }}>Required: <b>{bottleneckRequired}</b></div> */}
            <div style={{ fontSize: 16, marginBottom: 4 }}>Available: <b>{bottleneckAvailable}</b></div>
          </div>
          {/* Right: Financial Impact */}
          <div style={{ flex: 1, background: '#f5faff', border: '1.5px solid #b3e5fc', borderRadius: 10, padding: '22px 24px', minWidth: 320 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1976d2', marginBottom: 8 }}>💰 FINANCIAL IMPACT</div>
            <div style={{ fontSize: 16, marginBottom: 4 }}>Total Stock: <b>₹{(valueBefore/1e7).toFixed(2)} Cr</b></div>
            <div style={{ fontSize: 16, marginBottom: 4 }}>Used: <b>₹{(valueUsed/1e5).toFixed(2)} L</b></div>
            <div style={{ fontSize: 16, marginBottom: 4 }}>Remaining: <b>₹{(valueAfter/1e7).toFixed(2)} Cr</b></div>
          </div>
        </div>
      )}

      {/* SIMULATION PANEL (What-if Analysis) */}
      {forecast && bottleneck && (
        <SimulationPanel
          forecast={forecast}
          deviceCode={selectedDevice}
          onSimulate={handleSimulate}
        />
      )}

      {/* STOCK HEALTH SUMMARY */}
      {forecast && (
        <div style={{ background: '#e3f2fd', border: '1.5px solid #90caf9', borderRadius: 10, padding: '18px 32px', margin: '0 0 18px 0', fontSize: 18, fontWeight: 500, color: '#1976d2', display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'flex-start' }}>
          <span style={{ fontWeight: 700, color: '#43a047' }}>🟢 Healthy: {healthCounts.healthy}</span>
          <span style={{ fontWeight: 700, color: '#fbc02d' }}>🟡 Low: {healthCounts.low}</span>
          <span style={{ fontWeight: 700, color: '#d32f2f' }}>🔴 Critical: {healthCounts.critical}</span>
        </div>
      )}

      {/* DETAILED DATA SECTION (TABS) */}
      {forecast && (
        <div style={{ marginTop: 18 }}>
          <TabLayout
            tabs={[
              {
                label: "Inventory Summary",
                content: (
                  <div>
                    <InventorySummaryTable
                      partStockSummary={forecast.partStockSummary}
                      bottleneckPartIds={forecast.bottlenecks?.map(b => b.partId) || []}
                      page={invPage}
                      pageSize={pageSize}
                      onPageChange={setInvPage}
                    />
                  </div>
                )
              },
              {
                label: "Stock Health",
                content: (
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#1976d2", marginBottom: 18 }}>Stock Health</div>
                    <StockHealthTable
                      parts={forecast.perPartCapacity}
                      minCapacity={forecast.maxDeliverableQuantity}
                    />
                  </div>
                )
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}
