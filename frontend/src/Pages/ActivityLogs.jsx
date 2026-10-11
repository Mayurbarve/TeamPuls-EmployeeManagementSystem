import React from "react";
import { COLORS, SHADOWS } from "../Utils/colors";
import EmptyState from "../Components/EmptyState";
import LoadingSpinner from "../Components/LoadingSpinner";
import ActivityView from "../Components/ActivityView";

function ActivityLogs({
  employees,
  selectedId,
  setSelectedId,
  activityLogs,
  loading,
  error,
  date,
}) {
  const selected = employees.find((e) => e.employee_id === selectedId);

  return (
    <div
      style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: COLORS.gray[700],
            fontWeight: 500,
          }}
        >
          Select employee:
        </label>
        <select
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
          style={{
            minWidth: 220,
            padding: "8px 10px",
            borderRadius: 8,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 14,
          }}
        >
          <option value="">-- Choose --</option>
          {employees.map((emp) => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.name} ({emp.employee_id})
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: COLORS.gray[500] }}>
          Date: {date}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          background: "white",
          borderRadius: 16,
          boxShadow: SHADOWS.md,
          border: `1px solid ${COLORS.gray[200]}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {!selectedId ? (
          <EmptyState
            icon="📋"
            title="Select an Employee"
            description="Choose an employee to view detailed activity logs."
          />
        ) : loading ? (
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
        ) : (
          <ActivityView
            employee={selected}
            activityLogs={activityLogs}
            loading={loading}
            error={error}
            onBack={null}
            date={date}
          />
        )}
      </div>
    </div>
  );
}

export default ActivityLogs;