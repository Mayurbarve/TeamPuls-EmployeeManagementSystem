import React from "react";
import EmployeeCard from "../Components/EmployeeCard";
import EmptyState from "../Components/EmptyState";
import LoadingSpinner from "../Components/LoadingSpinner";
import { COLORS } from "../Utils/colors";

function MyEmployees({
  employees,
  loading,
  error,
  onSelect,
  onViewActivityLogs,
}) {
  return (
    <div
      style={{
        padding: 24,
        flex: 1,
        overflowY: "auto",
      }}
    >
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
            gap: 12,
          }}
        >
          <LoadingSpinner />
          Loading employees...
        </div>
      ) : error ? (
        <EmptyState
          icon="❌"
          title="Failed to Load Employees"
          description="Unable to load employees list. Please try again."
        />
      ) : employees.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Employees"
          description="No employees found. Add employees to start tracking."
        />
      ) : (
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.employee_id}
              employee={emp}
              isSelected={false}
              onClick={() => onSelect(emp.employee_id)}
              onViewActivity={onViewActivityLogs}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyEmployees;
