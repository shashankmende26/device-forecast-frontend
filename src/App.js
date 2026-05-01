import React, { useState } from "react";


import ExcelUpload from "./components/ExcelUpload";
import DeviceSelector from "./components/DeviceSelector";
import DeviceCardGrid from "./components/DeviceCardGrid";
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

function App() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceCards, setDeviceCards] = useState([]); // [{ code, name, capacity }]
  const [selectedDevice, setSelectedDevice] = useState("");
  const [viewMode, setViewMode] = useState("org"); // "org" or "device"
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("table");

  // On Excel upload, fetch all device forecasts and build deviceCards

  async function handleUploadSuccess(types) {
    setDeviceTypes(types);
    setSelectedDevice("");
    setForecast(null);
    setError("");
    // Artificial delay for better UX
    await new Promise(res => setTimeout(res, 1000));
    try {
      const cards = [];
      for (const code of types) {
        // Add a small delay for each device (optional, can remove if not needed)
        await new Promise(res => setTimeout(res, 1000));
        const res = await requestForecast(code);
        cards.push({
          code,
          name: code, // If you have a mapping for display name, use it here
          capacity: res.forecast?.maxDeliverableQuantity ?? 0
        });
      }
      setDeviceCards(cards);
    } catch (err) {
      setError("Failed to load device capacities: " + err.message);
    }
  }

  async function handleDeviceSelect(device) {
    setSelectedDevice(device);
    setForecast(null);
    setError("");
    setViewMode("device");
    setLoading(true);
    // Artificial delay for better UX
    await new Promise(res => setTimeout(res, 1000));
    try {
      const res = await requestForecast(device);
      setForecast(res.forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    <div style={{ position: 'relative', padding: 10, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            width: 48,
            height: 48,
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {/* HEADER SECTION */}
      <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 18, letterSpacing: -1, color: "#1976d2" }}>Device Forecast</div>
      {/* Only show Excel upload and org-level dashboard in org view */}
      {viewMode === "org" && (
        <div style={{ marginBottom: 18 }}>
          <ExcelUpload onUploadSuccess={handleUploadSuccess} />
          {deviceCards.length > 0 && (
            <>
              {/* ORGANIZATION CAPACITY OVERVIEW */}
              <div style={{
                background: '#f5f5f5', border: '1.5px solid #bdbdbd', borderRadius: 12, padding: '24px 32px', margin: '32px 0 22px 0', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 12px rgba(33,33,33,0.04)'
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: '#1976d2', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span role="img" aria-label="factory">🏭</span> ORGANIZATION CAPACITY OVERVIEW
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                  Total Buildable Units: {deviceCards.reduce((sum, d) => sum + d.capacity, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 16, color: '#555', marginBottom: 12 }}>
                  Devices Supported: {deviceCards.length}
                </div>
              </div>

              {/* DEVICE CAPACITY DISTRIBUTION (bars are clickable) */}
              <div style={{
                background: '#f5f5f5', border: '1.5px solid #bdbdbd', borderRadius: 12, padding: '24px 32px', margin: '0 0 22px 0', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 12px rgba(33,33,33,0.04)'
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span role="img" aria-label="chart">📊</span> DEVICE CAPACITY DISTRIBUTION
                </div>
                {deviceCards
                  .slice()
                  .sort((a, b) => b.capacity - a.capacity)
                  .map((d, i, arr) => {
                    const total = arr.reduce((sum, dev) => sum + dev.capacity, 0) || 1;
                    const percent = Math.round((d.capacity / total) * 100);
                    return (
                      <div key={d.code} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, cursor: 'pointer' }}
                        onClick={() => handleDeviceSelect(d.code)}
                      >
                        <span style={{ width: 90, fontWeight: 600, color: '#333', fontSize: 15 }}>{d.name}</span>
                        <div style={{ background: viewMode === "device" && selectedDevice === d.code ? '#1976d2' : '#1976d2', height: 16, width: percent * 2, minWidth: 8, borderRadius: 6, margin: '0 8px', opacity: viewMode === "device" && selectedDevice === d.code ? 0.5 : 0.15, border: viewMode === "device" && selectedDevice === d.code ? '2px solid #1976d2' : 'none' }} />
                        <span style={{ fontWeight: 700, color: '#1976d2', fontSize: 15, minWidth: 40 }}>{d.capacity}</span>
                      </div>
                    );
                  })}
              </div>

              {/* DEVICE CLASSIFICATION */}
              <div style={{
                background: '#f5f5f5', border: '1.5px solid #bdbdbd', borderRadius: 12, padding: '24px 32px', margin: '0 0 22px 0', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 12px rgba(33,33,33,0.04)'
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span role="img" aria-label="folder">📂</span> DEVICE CLASSIFICATION
                </div>
                {/* Classification logic */}
                {(() => {
                  const total = deviceCards.reduce((sum, d) => sum + d.capacity, 0) || 1;
                  const classified = deviceCards
                    .map(d => ({
                      ...d,
                      contributionPercent: (d.capacity / total) * 100
                    }))
                    .sort((a, b) => b.capacity - a.capacity);
                  const high = classified.filter(d => d.contributionPercent >= 20);
                  const medium = classified.filter(d => d.contributionPercent >= 5 && d.contributionPercent < 20);
                  const low = classified.filter(d => d.contributionPercent < 5);
                  return (
                    <>
                      <div style={{ fontWeight: 700, color: '#43a047', marginBottom: 4 }}>🟢 HIGH CAPACITY</div>
                      <div style={{ marginBottom: 10 }}>
                        {high.length > 0 ? high.map(d => <span key={d.code} style={{ display: 'inline-block', background: '#e8f5e9', color: '#388e3c', borderRadius: 6, padding: '3px 10px', margin: '0 6px 6px 0', fontWeight: 600 }}>{d.name}</span>) : <span style={{ color: '#888' }}>None</span>}
                      </div>
                      <div style={{ fontWeight: 700, color: '#fbc02d', marginBottom: 4 }}>🟡 MEDIUM</div>
                      <div style={{ marginBottom: 10 }}>
                        {medium.length > 0 ? medium.map(d => <span key={d.code} style={{ display: 'inline-block', background: '#fffde7', color: '#fbc02d', borderRadius: 6, padding: '3px 10px', margin: '0 6px 6px 0', fontWeight: 600 }}>{d.name}</span>) : <span style={{ color: '#888' }}>None</span>}
                      </div>
                      <div style={{ fontWeight: 700, color: '#d32f2f', marginBottom: 4 }}>🔴 LOW / BLOCKED</div>
                      <div style={{ marginBottom: 4 }}>
                        {low.length > 0 ? low.map(d => <span key={d.code} style={{ display: 'inline-block', background: '#ffebee', color: '#d32f2f', borderRadius: 6, padding: '3px 10px', margin: '0 6px 6px 0', fontWeight: 600 }}>{d.name}</span>) : <span style={{ color: '#888' }}>None</span>}
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}

        {/* Device details view: only show when in device mode */}
        {deviceCards.length > 0 && viewMode === "device" && selectedDevice && (
          <div style={{ maxWidth: 900, margin: '32px auto 0 auto', padding: 16 }}>
            <button onClick={() => {
              setViewMode("org");
              setSelectedDevice("");
              setForecast(null);
            }} style={{ marginBottom: 18, padding: '6px 18px', borderRadius: 6, border: '1.5px solid #1976d2', background: '#f5faff', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>← Back to Organization View</button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1976d2', marginBottom: 18 }}>Device Details: {selectedDevice}</div>
            {/* ...existing device details UI (production limits, bottlenecks, etc.) will show below... */}
          </div>
        )}
        {error && <div style={{ color: "#d32f2f", margin: "12px 0 0 0", fontWeight: 500, fontSize: 17 }}>{error}</div>}

        {/* PRODUCTION LIMIT ALERT */}
        {forecast && maxUnits > 0 && bottleneck && (
        <div style={{
          background: '#fffbe6',
          border: '2px solid #ffe082',
          borderRadius: 14,
          padding: '28px 36px',
          margin: '32px 0 22px 0',
          color: '#b26a00',
          boxShadow: '0 4px 18px rgba(255, 193, 7, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, color: '#d32f2f', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span role="img" aria-label="alert">🚨</span> PRODUCTION LIMITED
          </div>
          <div style={{ fontSize: 18, color: '#333', marginBottom: 18, fontWeight: 600, textAlign: 'center' }}>
            {selectedDevice && (
              <span style={{ color: '#1976d2', fontWeight: 700, fontSize: 20, marginRight: 8, letterSpacing: 0 }}>{selectedDevice}</span>
            )}
            <span style={{ color: '#b26a00', fontWeight: 600 }}>can produce only</span>
            <span style={{ color: '#d32f2f', fontWeight: 800, fontSize: 22, margin: '0 8px' }}>{maxUnits} units</span>
          </div>
          <div style={{
            background: '#f3e5f5',
            border: '1.5px solid #ce93d8',
            borderRadius: 8,
            padding: '12px 18px',
            color: '#6a1b9a',
            fontWeight: 600,
            fontSize: 17,
            marginBottom: 6,
            textAlign: 'center',
            maxWidth: 420,
          }}>
            <span>Due to shortage of:</span>
            <span style={{ color: '#1976d2', fontWeight: 700, marginLeft: 8 }}>{bottleneckName}</span>
            <span style={{ color: '#888', fontWeight: 500, marginLeft: 6 }}>({bottleneckId})</span>
          </div>
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

export default App;