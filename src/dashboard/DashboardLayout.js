import React from "react";
import HeroSection from "./HeroSection";
import DeviceCapacityChart from "./DeviceCapacityChart";
import DeviceClassification from "./DeviceClassification";
import DeviceDetails from "./DeviceDetails";
import SimulationPanel from "../components/SimulationPanel";
import TopBottlenecksPanel from "./TopBottlenecksPanel";
import StockUtilizationPanel from "./StockUtilizationPanel";
import FinancialConclusion from "./FinancialConclusion";
import DetailsTabs from "./DetailsTabs";
import "./dashboard.css";

export default function DashboardLayout(props) {
  const {
    orgStats,
    devices,
    selectedDevice,
    onDeviceSelect,
    bottlenecks,
    stockUtilization,
    detailsTabsProps,
    forecast,
    deviceCode,
    onSimulate
  } = props;
console.log("DashboardLayout props:", props);
  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div className="dashboard-title">Eruvaka Inventory Management System</div>
        <div className="dashboard-upload">{props.uploadComponent}</div>
      </header>
      <HeroSection {...orgStats} />
      <div className="dashboard-main">
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 32 }}>
          <div className="dashboard-main-left">
            <DeviceCapacityChart devices={devices} selectedDevice={selectedDevice} onDeviceSelect={onDeviceSelect} />
            {/* <DeviceClassification devices={devices} selectedDevice={selectedDevice} onDeviceSelect={onDeviceSelect} /> */}
          </div>
          <div className="dashboard-main-right">
            {/* Device-level financials at the top */}
            {selectedDevice && forecast && (
              <div style={{ marginBottom: 18 }}>
                <div className="dashboard-card dashboard-device-financials" style={{ marginBottom: 18, padding: 18, background: '#f5faff', border: '1px solid #e3e8ee' }}>
                  <div style={{ fontWeight: 600, color: '#1976d2', fontSize: 16, marginBottom: 6 }}>Product Financial Forecast</div>
                  {(() => {
                    // Helper to format value in cr/lakh/thousand/rupees
                    function formatValue(val) {
                      if (val >= 1e7) return (val / 1e7).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' cr';
                      if (val >= 1e5) return (val / 1e5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' lakh';
                      if (val >= 1e3) return (val / 1e3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' K';
                      return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    }
                    const before = forecast.totalValueBefore || 0;
                    const after = forecast.totalValueAfter || 0;
                    const used = before - after;
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 32, marginBottom: 6 }}>
                          <div><span style={{ color: '#555' }}>Before:</span> <b>₹{formatValue(before)}</b></div>
                          <div><span style={{ color: '#555' }}>Used:</span> <b>₹{formatValue(used)}</b></div>
                          <div><span style={{ color: '#555' }}>Remaining:</span> <b>₹{formatValue(after)}</b></div>
                        </div>
                        <div style={{ color: '#555', fontSize: 15 }}>
                          {used > 0
                            ? `₹${formatValue(used)} of inventory was utilized for this device. Remaining: ₹${formatValue(after)}.`
                            : 'No inventory was utilized for this device.'}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            {/* Device details and simulator side by side above table */}
            {selectedDevice && forecast && forecast.bottlenecks && forecast.bottlenecks.length > 0 && (
              <div className="device-details-sim-row">
                <div className="device-details-sim-col">
                  <DeviceDetails device={selectedDevice} />
                </div>
                <div className="device-details-sim-col">
                  <SimulationPanel
                    forecast={forecast}
                    deviceCode={deviceCode}
                    onSimulate={onSimulate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bottle-neck-utilization-con">
            <TopBottlenecksPanel bottlenecks={bottlenecks} />
            <StockUtilizationPanel {...stockUtilization} />
        </div>
        {/* {forecast && (
          <FinancialConclusion
            valueBefore={forecast.overallValueBefore || 0}
            valueAfter={forecast.overallValueAfter || 0}
            valueUsed={(forecast.overallValueBefore || 0) - (forecast.overallValueAfter || 0)}
          />
        )} */}
      </div>
      {/* Stretch details tabs full width at very bottom */}
      <div className="dashboard-details-tabs-fullwidth">
        <DetailsTabs {...detailsTabsProps} />
      </div>
    </div>
  );
}
