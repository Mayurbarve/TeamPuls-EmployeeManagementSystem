import React from "react";
import { COLORS } from "../Utils/colors";

function StatCard({ label, value, valueColor = COLORS.gray[900], icon }) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        border: `1px solid ${COLORS.gray[200]}`,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: COLORS.gray[600],
            fontWeight: 500,
          }}
        >
          {label}
        </div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: valueColor,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default StatCard;
