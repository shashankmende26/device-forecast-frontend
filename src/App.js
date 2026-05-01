import React, { useState } from "react";

import ExcelUpload from "./components/ExcelUpload";
import DeviceSelector from "./components/DeviceSelector";
import KPITiles from "./components/KPITiles";
import BottleneckExplanation from "./components/BottleneckExplanation";
import CapacityTable from "./components/CapacityTable";
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
  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 32, fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f4f6f8", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
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

      {/* View Toggle */}
      {forecast && (
        <ViewToggle view={view} setView={setView} />
      )}

      {/* Visual or Table View */}
      {forecast && view === "visual" && (
        <>
          <div style={{ fontSize: 20, fontWeight: 600, margin: "18px 0 8px 0", color: "#333" }}>Capacity by Part</div>
          <CapacityBarChart parts={forecast.perPartCapacity} minCapacity={forecast.maxDeliverableQuantity} />
          <CapacityHealthDonut parts={forecast.perPartCapacity} minCapacity={forecast.maxDeliverableQuantity} />
        </>
      )}
      {forecast && view === "table" && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: "#333" }}>Per-Part Capacity Breakdown</div>
          <CapacityTable parts={forecast.perPartCapacity} minCapacity={forecast.maxDeliverableQuantity} />
        </div>
      )}
    </div>
  );
}
