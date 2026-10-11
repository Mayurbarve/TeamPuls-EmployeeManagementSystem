// src/components/employees/EmployeeCard.jsx
import React from "react";
import { COLORS } from "../Utils/colors";
import Badge from "../Components/Badge";

function EmployeeCard({ employee, isSelected, onClick, onViewActivity }) {
  const {
    name,
    designation,
    domain,
    employee_id,
    active_minutes = 0,
    idle_minutes = 0,
    suspicious_flag_count = 0,
    status,
  } = employee;

  const isActive = status === "Active";

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
    <div
      style={{
        background: isSelected ? COLORS.primary[50] : "white",
        padding: 16,
        borderBottom: `1px solid ${COLORS.gray[100]}`,
        borderLeft: isSelected
          ? `4px solid ${COLORS.primary[500]}`
          : "4px solid transparent",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onClick={onClick}
      onMouseOver={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = COLORS.gray[50];
        }
      }}
      onMouseOut={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "white";
        }
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.gray[900],
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: COLORS.gray[600],
              marginBottom: 6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {designation} • {domain}
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.gray[500],
            }}
          >
            ID: {employee_id}
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            minWidth: 80,
            fontSize: 11,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: active_minutes > 0 ? COLORS.success[600] : COLORS.error[600],
              fontWeight: 600,
              marginBottom: 2,
            }}
          >
            {active_minutes}m active
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.gray[500],
            }}
          >
            {idle_minutes}m idle
          </div>
          {suspicious_flag_count > 0 && (
            <div
              style={{
                marginTop: 4,
              }}
            >
              <Badge color={COLORS.error[500]} small>
                {suspicious_flag_count} flag
                {suspicious_flag_count !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Status Button */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 6,
            border: `1px solid ${statusInfo.borderColor}`,
            background: statusInfo.bgColor,
            color: statusInfo.color,
            fontSize: 11,
            fontWeight: 600,
            cursor: "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 10 }}>{statusInfo.icon}</span>
          {statusInfo.text}
        </button>
      </div>

      {/* Activity Button */}
      <div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewActivity(employee_id);
          }}
          style={{
            width: "100%",
            padding: "8px 12px",
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
            justifyContent: "center",
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
          View Activity
        </button>
      </div>
    </div>
  );
}

export default EmployeeCard;
