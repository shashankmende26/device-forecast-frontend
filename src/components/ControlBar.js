import React from "react";
import "./ControlBar.css";

export default function ControlBar({ children }) {
  return (
    <div className="control-bar">
      {children}
    </div>
  );
}
