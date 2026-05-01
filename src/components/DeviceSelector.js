import React from "react";

export default function DeviceSelector({ deviceTypes, selected, onSelect }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label>
        Select Device:
        <select value={selected || ""} onChange={e => onSelect(e.target.value)}>
          <option value="" disabled>
            -- Choose a device --
          </option>
          {deviceTypes.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
