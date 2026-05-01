import React from "react";
import "./KPITiles.css";

export default function KPITiles({ maxDeliverableQuantity, maxFullDevices, primaryBottleneck, bottleneckCount }) {
  return (
    <div className="kpi-tiles">
      <div className="kpi-tile kpi-main">
        <div className="kpi-label">Max Deliverable Devices</div>
        <div className="kpi-value">{maxDeliverableQuantity}</div>
      </div>
      <div className="kpi-tile">
        <div className="kpi-label">Max Full Devices</div>
        <div className="kpi-value">{maxFullDevices}</div>
      </div>
      <div className="kpi-tile kpi-bottleneck">
        <div className="kpi-label">Primary Bottleneck</div>
        <div className="kpi-value">{primaryBottleneck?.partName || "-"}</div>
        <div className="kpi-sub">{primaryBottleneck ? `ID: ${primaryBottleneck.partId}` : ""}</div>
      </div>
      <div className="kpi-tile kpi-risk">
        <div className="kpi-label">At-Risk Parts</div>
        <div className="kpi-value">{bottleneckCount}</div>
      </div>
    </div>
  );
}
