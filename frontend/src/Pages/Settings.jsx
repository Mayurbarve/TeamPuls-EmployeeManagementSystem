import React from "react";
import { COLORS, SHADOWS } from "../Utils/colors";

function Settings() {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: SHADOWS.md,
          border: `1px solid ${COLORS.gray[200]}`,
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 16,
            fontSize: 18,
            color: COLORS.gray[900],
          }}
        >
          Settings
        </h3>
        <p
          style={{
            fontSize: 13,
            color: COLORS.gray[500],
            marginBottom: 16,
          }}
        >
          Global configuration for how TeamPulse behaves. These controls are UI
          placeholders; later you can connect them to backend configs.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontSize: 13, color: COLORS.gray[700] }}>
            <input type="checkbox" style={{ marginRight: 8 }} />
            Enable suspicious activity detection
          </label>
          <label style={{ fontSize: 13, color: COLORS.gray[700] }}>
            <input type="checkbox" style={{ marginRight: 8 }} />
            Allow managers to view detailed logs
          </label>
          <label style={{ fontSize: 13, color: COLORS.gray[700] }}>
            <input type="checkbox" style={{ marginRight: 8 }} />
            Email summary to admin daily
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;
