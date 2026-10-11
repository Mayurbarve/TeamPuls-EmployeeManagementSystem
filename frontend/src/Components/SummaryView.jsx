import React from "react";
import { COLORS } from "../Utils/colors";
import MetricCard from "./MetricCard";
import Badge from "./Badge";
import { formatTime } from "../Utils/formatTime";
import { formatDuration } from "../Utils/formatDuration";

function SummaryView({ summary, employee, onViewActivity }) {
  const isActive = employee?.status === "Active";

  const statusInfo = isActive
    ? {
        text: "Active Now",
        color: COLORS.success[500],
        bgColor: COLORS.success[50],
        borderColor: COLORS.success[200],
        icon: "🟢",
      }
    : {
        text: "Inactive",
        color: COLORS.gray[500],
        bgColor: COLORS.gray[100],
        borderColor: COLORS.gray[300],
        icon: "⚫",
      };

  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: "24px 24px 20px",
          borderBottom: `1px solid ${COLORS.gray[200]}`,
          background: COLORS.gray[50],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 24,
                  color: COLORS.gray[900],
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                }}
              >
                {summary.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <button
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: `1px solid ${statusInfo.borderColor}`,
                    background: statusInfo.bgColor,
                    color: statusInfo.color,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "default",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 10 }}>{statusInfo.icon}</span>
                  {statusInfo.text}
                </button>
                <button
                  onClick={onViewActivity}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.primary[300]}`,
                    background: COLORS.primary[50],
                    color: COLORS.primary[700],
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = COLORS.primary[100];
                    e.target.style.borderColor = COLORS.primary[400];
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = COLORS.primary[50];
                    e.target.style.borderColor = COLORS.primary[300];
                  }}
                >
                  <span>📊</span>
                  View Activity Logs
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <Badge color={COLORS.success[500]}>{summary.designation}</Badge>
              <span
                style={{
                  fontSize: 14,
                  color: COLORS.gray[600],
                }}
              >
                {summary.domain} • {summary.work_mode}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                fontSize: 13,
                color: COLORS.gray[600],
              }}
            >
              <span>ID: {summary.employee_id}</span>
              <span>•</span>
              <span>Joined: {summary.joining_date}</span>
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: 13,
              color: COLORS.gray[600],
              minWidth: 180,
            }}
          >
            <div style={{ marginBottom: 4 }}>
              Manager:{" "}
              <strong style={{ color: COLORS.gray[900] }}>
                {summary.manager_name}
              </strong>
            </div>
            <div>Location: {summary.location}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 24, flex: 1 }}>
        {/* Key Metrics */}
        <div style={{ marginBottom: 24 }}>
          <h4
            style={{
              margin: "0 0 16px",
              fontSize: 16,
              color: COLORS.gray[900],
              fontWeight: 600,
            }}
          >
            Daily Activity
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard
              label="Login Time"
              value={formatTime(summary.login_time)}
              color={COLORS.primary[600]}
              icon="🕒"
            />
            <MetricCard
              label="Logout Time"
              value={formatTime(summary.logout_time)}
              color={COLORS.success[600]}
              icon="🚪"
            />
            <MetricCard
              label="Active Time"
              value={formatDuration(summary.active)}
              color={COLORS.warning[600]}
              icon="⚡"
            />
            <MetricCard
              label="Idle Time"
              value={formatDuration(summary.idle)}
              color={COLORS.error[600]}
              icon="😴"
            />
            <MetricCard
              label="Suspicious Flags"
              value={summary.suspicious_flag_count}
              color={COLORS.primary[600]}
              icon="🚩"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div
          style={{
            background: COLORS.gray[50],
            padding: 16,
            borderRadius: 12,
            border: `1px solid ${COLORS.gray[200]}`,
          }}
        >
          <h5
            style={{
              margin: "0 0 8px",
              fontSize: 14,
              color: COLORS.gray[900],
              fontWeight: 600,
            }}
          >
            Tracking Information
          </h5>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: COLORS.gray[600],
              lineHeight: 1.5,
            }}
          >
            Active and idle time tracking depends on the TeamPulse agent running
            on the employee&apos;s machine. Suspicious activity is flagged based
            on predefined security rules and behavioral patterns.
          </p>
        </div>
      </div>
    </>
  );
}

export default SummaryView;
