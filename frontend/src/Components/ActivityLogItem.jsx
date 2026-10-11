// src/components/activity/ActivityLogItem.jsx
import React from "react";
import { COLORS, SHADOWS } from "../Utils/colors";
import Badge from "./Badge";
import { formatTime } from "../Utils/formatTime";

function ActivityLogItem({ log }) {
  const getActivityTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "active":
        return COLORS.success[500];
      case "idle":
        return COLORS.warning[500];
      case "suspicious":
        return COLORS.error[500];
      default:
        return COLORS.primary[500];
    }
  };

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "active":
        return "💻";
      case "idle":
        return "😴";
      case "suspicious":
        return "🚩";
      default:
        return "📝";
    }
  };

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${COLORS.gray[200]}`,
        background: "white",
        boxShadow: SHADOWS.sm,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>
              {getActivityIcon(log.type)}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.gray[900],
              }}
            >
              {log.title || "Activity"}
            </span>
            <Badge color={getActivityTypeColor(log.type)} small>
              {log.type || "Unknown"}
            </Badge>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: COLORS.gray[600],
              lineHeight: 1.4,
            }}
          >
            {log.description || "No description available"}
          </p>
        </div>
        <div
          style={{
            textAlign: "right",
            minWidth: 100,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.gray[700],
              marginBottom: 2,
            }}
          >
            {formatTime(log.timestamp)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.gray[500],
            }}
          >
            {log.duration || "--"}
          </div>
        </div>
      </div>

      {log.details && (
        <div
          style={{
            padding: 8,
            background: COLORS.gray[50],
            borderRadius: 6,
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.gray[600],
              fontFamily: "monospace",
            }}
          >
            {log.details}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogItem;
