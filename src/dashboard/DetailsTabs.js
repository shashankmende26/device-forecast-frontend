import React from "react";

export default function DetailsTabs({ inventorySummary, stockHealth }) {
  const [tab, setTab] = React.useState("inventory");
  return (
    <section className="dashboard-card dashboard-details-tabs">
      <div className="details-tabs-header">
        <button className={tab === "inventory" ? "active" : ""} onClick={() => setTab("inventory")}>Inventory Summary</button>
        <button className={tab === "stock" ? "active" : ""} onClick={() => setTab("stock")}>Stock Health</button>
      </div>
      <div className="details-tabs-content">
        {tab === "inventory" ? inventorySummary : stockHealth}
      </div>
    </section>
  );
}
