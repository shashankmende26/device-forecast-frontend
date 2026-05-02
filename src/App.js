import React, { useState } from "react";
import DashboardLayout from "./dashboard/DashboardLayout";
import "./dashboard/dashboard.css";


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
    setLoading(true);
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

      // Always show loading for at least 1 second
      await new Promise(res => setTimeout(res, 1000));
      setDeviceCards(cards);
    } catch (err) {
      setError("Failed to load device capacities: " + err.message);
    } finally {
      setLoading(false);
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
      // Always show loading for at least 1 second
      await new Promise(res2 => setTimeout(res2, 1000));
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

  // Map data for new dashboard components
  const totalUnits = deviceCards.reduce((sum, d) => sum + (d.capacity || d.units || 0), 0);
  const totalDevices = deviceCards.length;
  const utilizationPct = idealUnits ? Math.round((maxUnits / idealUnits) * 100) : 0;
  const blockedUnits = lostUnits;
  // Map devices for chart/classification
  const devices = deviceCards.map(d => ({
    code: d.code,
    name: d.name,
    units: d.capacity || d.units || 0,
    contributionPct: totalUnits ? Math.round(((d.capacity || d.units || 0) / totalUnits) * 100) : 0,
    bottleneck: forecast && selectedDevice === d.code && bottleneckName ? bottleneckName : (d.bottleneck || "")
  }));
  // Top bottlenecks panel
  const bottlenecks = (forecast?.bottlenecks || []).map(b => ({
    partId: b.partId,
    partName: b.partName,
    unitsBlocked: b.unitsBlocked || b.blockedUnits || 0,
    affectedDevices: b.affectedDevices || 1
  }));
  // Stock utilization
  const usedPct = valueBefore ? Math.round((valueUsed / valueBefore) * 100) : 0;
  const idlePct = 100 - usedPct;
  // Details tabs
  const detailsTabsProps = {
    inventorySummary: (
      <InventorySummaryTable
        partStockSummary={forecast?.partStockSummary || []}
        bottleneckPartIds={forecast?.bottlenecks?.map(b => b.partId) || []}
        page={invPage}
        pageSize={pageSize}
        onPageChange={setInvPage}
      />
    ),
    stockHealth: (
      <StockHealthTable
        parts={forecast?.perPartCapacity || []}
        minCapacity={forecast?.maxDeliverableQuantity || 0}
      />
    )
  };
  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.85)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 60%, #90caf9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              boxShadow: '0 4px 18px rgba(33,33,33,0.10)'
            }}>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="16" stroke="#fff" strokeWidth="5" strokeDasharray="80" strokeDashoffset="60"/>
                <circle cx="19" cy="19" r="10" fill="#fff" opacity="0.15"/>
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1976d2', marginBottom: 6, letterSpacing: -1, textAlign: 'center' }}>
              Loading Inventory & Forecasts…
            </div>
            <div style={{ fontSize: 16, color: '#555', textAlign: 'center', maxWidth: 340 }}>
              Please wait while we analyze your Excel data and calculate product build capacity.<br/>
              This may take a few seconds for large files or many products.
            </div>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
            .custom-loader-anim { animation: spin 1.2s linear infinite; }`}</style>
        </div>
      )}
      <DashboardLayout
        orgStats={{
          totalUnits,
          totalDevices,
          utilizationPct,
          blockedUnits,
          valueBefore,
          valueAfter,
          valueUsed
        }}
        devices={devices}
        selectedDevice={devices.find(d => d.code === selectedDevice) || null}
        onDeviceSelect={code => {
          setSelectedDevice(code);
          setViewMode("device");
          setLoading(true);
          requestForecast(code).then(res => {
            setForecast(res.forecast);
            setLoading(false);
          });
        }}
        bottlenecks={bottlenecks}
        stockUtilization={{ usedPct, idlePct }}
        detailsTabsProps={detailsTabsProps}
        uploadComponent={<ExcelUpload onUploadSuccess={handleUploadSuccess} />}
        forecast={forecast}
        deviceCode={selectedDevice}
        onSimulate={handleSimulate}
      />
      {error && <div style={{ color: "#d32f2f", margin: "12px 0 0 0", fontWeight: 500, fontSize: 17, textAlign: 'center' }}>{error}</div>}
    </>
  );
}

export default App;