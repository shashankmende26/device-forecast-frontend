import React from "react";

export default function DeviceCardGrid({ devices, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '8px 0' }}>
      {devices.map(device => (
        <div
          key={device.code}
          onClick={() => onSelect(device.code)}
          style={{
            minWidth: 90,
            maxWidth: 110,
            minHeight: 54,
            background: selected === device.code ? '#ede7f6' : '#fff',
            border: selected === device.code ? '1.5px solid #7e57c2' : '1px solid #bdbdbd',
            borderRadius: 8,
            boxShadow: selected === device.code ? '0 1px 4px rgba(126,87,194,0.10)' : '0 1px 4px rgba(189,189,189,0.07)',
            cursor: 'pointer',
            padding: '6px 6px 4px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 500,
            fontSize: 12,
            transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{device.name}</div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>{device.code}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1976d2' }}>{device.capacity} FGs</div>
        </div>
      ))}
    </div>
  );
}
