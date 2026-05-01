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
import ControlBar from "./components/ControlBar";
import ViewToggle from "./components/ViewToggle";
import CapacityBarChart from "./components/CapacityBarChart";
import CapacityHealthDonut from "./components/CapacityHealthDonut";
import { fetchDeviceTypes, requestForecast } from "./api";

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

  return (
    <div style={{ padding: 10}}>
      {/* Header */}
      <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 18, letterSpacing: -1, color: "#1976d2" }}>Device Forecast</div>

      {/* Control Bar */}
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

      {/* KPI Tiles */}
      {forecast && (
        <KPITiles
          maxDeliverableQuantity={forecast.maxDeliverableQuantity}
          maxFullDevices={forecast.maxFullDevices}
          primaryBottleneck={primaryBottleneck}
          bottleneckCount={bottleneckCount}
        />
      )}

      {/* Bottleneck Explanation */}
      {forecast && selectedDevice && primaryBottleneck && (
        <BottleneckExplanation
          device={selectedDevice}
          max={forecast.maxDeliverableQuantity}
          bottleneck={primaryBottleneck}
        />
      )}

      {/* Tab-based layout for summary/health views */}
      {forecast && (
        <>
          {/* Stock summary cards (INR only) */}
          <StockSummaryCards
            valueBefore={forecast.overallValueBefore}
            valueUsed={forecast.overallValueBefore - forecast.overallValueAfter}
            valueAfter={forecast.overallValueAfter}
          />
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
        </>
      )}
    </div>
  );
}
