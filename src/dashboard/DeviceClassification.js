import React from "react";

function getClassification(devices) {
  return {
    high: devices.filter(d => d.contributionPct >= 20),
    medium: devices.filter(d => d.contributionPct >= 5 && d.contributionPct < 20),
    low: devices.filter(d => d.contributionPct < 5)
  };
}

export default function DeviceClassification({ devices, selectedDevice, onDeviceSelect }) {
  const { high, medium, low } = getClassification(devices);
  return (
    <section className="dashboard-card dashboard-classification">
      <div className="dashboard-section-title">Device Classification</div>
      <div className="classification-group high">
        <div className="classification-label high">High Capacity</div>
        <div className="classification-chips">
          {high.map(device => (
            <div
              key={device.code}
              className={"device-chip high" + (selectedDevice === device.code ? " selected" : "")}
              onClick={() => onDeviceSelect(device.code)}
            >
              <div className="chip-title">{device.name}</div>
              <div className="chip-units">{device.units} units</div>
              <div className="chip-pct">{device.contributionPct}%</div>
              <div className="chip-bottleneck">{device.bottleneck}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="classification-group medium">
        <div className="classification-label medium">Medium Capacity</div>
        <div className="classification-chips">
          {medium.map(device => (
            <div
              key={device.code}
              className={"device-chip medium" + (selectedDevice === device.code ? " selected" : "")}
              onClick={() => onDeviceSelect(device.code)}
            >
              <div className="chip-title">{device.name}</div>
              <div className="chip-units">{device.units} units</div>
              <div className="chip-pct">{device.contributionPct}%</div>
              <div className="chip-bottleneck">{device.bottleneck}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="classification-group low">
        <div className="classification-label low">Low Capacity</div>
        <div className="classification-chips">
          {low.map(device => (
            <div
              key={device.code}
              className={"device-chip low" + (selectedDevice === device.code ? " selected" : "")}
              onClick={() => onDeviceSelect(device.code)}
            >
              <div className="chip-title">{device.name}</div>
              <div className="chip-units">{device.units} units</div>
              <div className="chip-pct">{device.contributionPct}%</div>
              <div className="chip-bottleneck">{device.bottleneck}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
