import React from "react";
import "./ViewToggle.css";

export default function ViewToggle({ view, setView }) {
  return (
    <div className="view-toggle">
      <button
        className={view === "table" ? "active" : ""}
        onClick={() => setView("table")}
      >
        Table View
      </button>
      <button
        className={view === "visual" ? "active" : ""}
        onClick={() => setView("visual")}
      >
        Visual View
      </button>
    </div>
  );
}
