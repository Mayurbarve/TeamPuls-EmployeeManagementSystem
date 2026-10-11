import React, { useState } from "react";
import { COLORS, SHADOWS } from "../Utils/colors";
import { useApi } from "../Hooks/useApi";

function AddEmployee() {
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    designation: "",
    domain: "",
    department: "",
    location: "Office",
    work_mode: "Hybrid",
    employee_type: "",
    salary_band: "",
    joining_date: "",
    manager_name: "",
    manager_email: "",
  });

  const { callApi, loading, error, setError } = useApi();
  const [success, setSuccess] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employee_id.trim() || !form.name.trim()) {
      setError("Employee ID and Name are required");
      return;
    }

    try {
      setError(null);
      setSuccess("");

      await callApi("/employees", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSuccess("Employee added successfully");

      // Reset form
      setForm({
        employee_id: "",
        name: "",
        email: "",
        phone: "",
        designation: "",
        domain: "",
        department: "",
        location: "Office",
        work_mode: "Hybrid",
        employee_type: "",
        salary_band: "",
        joining_date: "",
        manager_name: "",
        manager_email: "",
      });
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
          Add Employee
        </h3>

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

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12 }}
        >
          {/* Basic fields */}
          {[
            { key: "employee_id", label: "Employee ID", required: true },
            { key: "name", label: "Name", required: true },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "designation", label: "Designation" },
            { key: "domain", label: "Domain" },
            { key: "department", label: "Department" },
            { key: "employee_type", label: "Employee Type" },
            { key: "salary_band", label: "Salary Band" },
            { key: "manager_name", label: "Manager Name" },
            { key: "manager_email", label: "Manager Email" },
            { key: "location", label: "Location" },
          ].map((field) => (
            <div key={field.key}>
              <label
                style={{
                  fontSize: 13,
                  color: COLORS.gray[700],
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <input
                value={form[field.key]}
                onChange={handleChange(field.key)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.gray[300]}`,
                  fontSize: 14,
                }}
                placeholder={`Enter ${field.label}`}
              />
            </div>
          ))}

          {/* Joining Date */}
          <div>
            <label
              style={{
                fontSize: 13,
                color: COLORS.gray[700],
                fontWeight: 500,
                display: "block",
                marginBottom: 6,
              }}
            >
              Joining Date
            </label>
            <input
              type="date"
              value={form.joining_date}
              onChange={handleChange("joining_date")}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${COLORS.gray[300]}`,
                fontSize: 14,
              }}
            />
          </div>

          {/* Work Mode */}
          <div>
            <label
              style={{
                fontSize: 13,
                color: COLORS.gray[700],
                fontWeight: 500,
                marginBottom: 6,
                display: "block",
              }}
            >
              Work Mode
            </label>

            <select
              value={form.work_mode}
              onChange={handleChange("work_mode")}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${COLORS.gray[300]}`,
                fontSize: 14,
              }}
            >
              <option value="Office">Office</option>
              <option value="WFH">WFH</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: SHADOWS.sm,
            }}
          >
            {loading ? "Saving..." : "Save Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;
