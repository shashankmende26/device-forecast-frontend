import React from "react";

export default function DeviceDetails({ device }) {
  if (!device) return null;
  return (
    <section className="dashboard-card dashboard-device-details">
      <div className="dashboard-section-title">Product</div>
      <div className="device-details-row">
        <div className="device-details-label">Product:</div>
        <div className="device-details-value">{device.name}</div>
      </div>
      <div className="device-details-row">
        <div className="device-details-label">Buildable Units:</div>
        <div className="device-details-value">{device.units}</div>
      </div>
      <div className="device-details-row">
        <div className="device-details-label">Contribution %:</div>
        <div className="device-details-value">{device.contributionPct}%</div>
      </div>
      <div className="device-details-row">
        <div className="device-details-label">Primary Bottleneck:</div>
        <div className="device-details-value">{device.bottleneck}</div>
      </div>
    </section>
  );
}
