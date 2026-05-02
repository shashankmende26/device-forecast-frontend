import React from "react";

export default function DeviceCapacityChart({ devices, selectedDevice, onDeviceSelect }) {
  // Color logic: high (green), medium (yellow), low (red)
  function getBarColor(pct) {
    // if (pct >= 20) return '#43a047';
    // if (pct >= 5) return '#fbc02d';
    return '#43a047'; // Just use green for now since we want to encourage users to focus on high contribution devices
  }
  return (
    <section className="dashboard-card dashboard-chart">
      <div className="dashboard-section-title">Device Capacity Distribution</div>
      <div className="device-bar-list">
        {devices.sort((a, b) => b.units - a.units).map(device => (
          <div
            key={device.code}
            className={"device-bar-row" + (selectedDevice && selectedDevice.code === device.code ? " selected" : "")}
            onClick={() => onDeviceSelect(device.code)}
          >
            <div className="device-bar-label">{device.name}</div>
            <div className="device-bar" style={{ position: 'relative', background: '#f5f5f5' }}>
              <div
                className="device-bar-fill"
                style={{ width: device.contributionPct + "%", background: getBarColor(device.contributionPct), opacity: 0.85, zIndex: 1 }}
              />
              <span className="device-bar-units" style={{ position: 'absolute', left: 12, top: 2, color: '#222', fontWeight: 700, zIndex: 2 }}>{device.units}</span>
              <span className="device-bar-pct" style={{ position: 'absolute', right: 12, top: 2, color: 'black', fontWeight: 700, zIndex: 2 }}>{device.contributionPct}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
