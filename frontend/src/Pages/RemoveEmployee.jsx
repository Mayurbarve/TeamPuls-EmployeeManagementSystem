import React, { useState } from "react";
import { COLORS, SHADOWS } from "../Utils/colors";
import { useApi } from "../Hooks/useApi";

function RemoveEmployee({ employees }) {
  const [selectedId, setSelectedId] = useState("");
  const { callApi, loading, error, setError } = useApi();
  const [success, setSuccess] = useState("");

  const handleRemove = async () => {
    if (!selectedId) {
      setError("Please select an employee to remove");
      return;
    }

    const emp = employees.find((e) => e.employee_id === selectedId);
    const confirmMsg = `Are you sure you want to remove ${
      emp?.name || selectedId
    }?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setError(null);
      setSuccess("");

      await callApi(`/employees/${selectedId}`, {
        method: "DELETE",
      });

      setSuccess("Employee removed successfully");
      setSelectedId("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          maxWidth: 700,
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
          Remove Employee
        </h3>
        <p
          style={{
            fontSize: 13,
            color: COLORS.gray[500],
            marginBottom: 16,
          }}
        >
          Select an employee and remove them from tracking using the API.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: COLORS.error[50],
              color: COLORS.error[600],
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: COLORS.success[50],
              color: COLORS.success[600],
              fontSize: 13,
            }}
          >
            {success}
          </div>
        )}

        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            if (error) setError(null);
            if (success) setSuccess("");
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${COLORS.gray[300]}`,
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          <option value="">Select employee</option>
          {employees.map((emp) => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.name} ({emp.employee_id})
            </option>
          ))}
        </select>

        <button
          onClick={handleRemove}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: COLORS.error[500],
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: SHADOWS.sm,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Removing..." : "Remove Employee"}
        </button>
      </div>
    </div>
  );
}

export default RemoveEmployee;
