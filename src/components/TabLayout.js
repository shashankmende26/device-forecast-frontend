import React, { useState } from "react";
import "./TabLayout.css";

export default function TabLayout({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div className="tab-layout">
      <div className="tab-header">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={active === idx ? "tab-active" : ""}
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{tabs[active].content}</div>
    </div>
  );
}
