import React from "react";
import { COLORS, SHADOWS } from "../Utils/colors";
import EmptyState from "../Components/EmptyState";
import Badge from "../Components/Badge";

function SuspiciousReports({ employees }) {
  const flagged = employees.filter(
    (e) => (e.suspicious_flag_count || 0) > 0
  );

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
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
            marginBottom: 12,
            fontSize: 18,
            color: COLORS.gray[900],
          }}
        >
          Suspicious Reports
        </h3>
        <p
          style={{
            fontSize: 13,
            color: COLORS.gray[500],
            marginBottom: 16,
          }}
        >
          This view highlights employees with suspicious activity flags based on
          the agent’s detection rules.
        </p>

        {flagged.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No Suspicious Activity"
            description="No suspicious behavior detected for the selected date."
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {flagged.map((emp) => (
              <div
                key={emp.employee_id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.error[200]}`,
                  background: COLORS.error[50],
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.gray[900],
                    }}
                  >
                    {emp.name} ({emp.employee_id})
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.gray[600],
                    }}
                  >
                    {emp.designation} • {emp.domain}
                  </div>
                </div>
                <Badge color={COLORS.error[500]}>
                  {emp.suspicious_flag_count} suspicious flag
                  {emp.suspicious_flag_count !== 1 ? "s" : ""}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuspiciousReports;
