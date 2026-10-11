import React from "react";
import { COLORS } from "../Utils/colors";

function MetricCard({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "white",
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${COLORS.gray[200]}`,
        textAlign: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          fontSize: 20,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          color: COLORS.gray[600],
          marginBottom: 6,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default MetricCard;
