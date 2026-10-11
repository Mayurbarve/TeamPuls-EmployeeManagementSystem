// src/components/activity/ActivityView.jsx
import React from "react";
import { COLORS } from "../Utils/colors";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import ActivityLogItem from "./ActivityLogItem";

function ActivityView({ employee, activityLogs, loading, error, onBack, date }) {
  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${COLORS.gray[200]}`,
          background: COLORS.gray[50],
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: `1px solid ${COLORS.gray[300]}`,
              background: "white",
              color: COLORS.gray[700],
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
        )}
        <div>
          <h3
            style={{
              margin: "0 0 4px",
              fontSize: 18,
              color: COLORS.gray[900],
              fontWeight: 600,
            }}
          >
            Activity Logs - {employee?.name || "-"}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: COLORS.gray[500],
            }}
          >
            Detailed activity timeline for {date}
          </p>
        </div>
      </div>

      {/* Activity Content */}
      <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: COLORS.gray[500],
              fontSize: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <LoadingSpinner />
            Loading activity logs...
          </div>
        ) : error ? (
          <EmptyState
            icon="❌"
            title="Failed to Load Activity"
            description="Unable to load activity logs. Please try again."
          />
        ) : activityLogs.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Activity Logs"
            description="No activity logs found for this employee on the selected date."
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {activityLogs.map((log, index) => (
              <ActivityLogItem key={index} log={log} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ActivityView;
