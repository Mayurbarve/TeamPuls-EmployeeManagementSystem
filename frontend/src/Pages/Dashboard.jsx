import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import Sidebar from "../Components/Sidebar";
import StatCard from "../Components/StatCard";
import EmployeeCard from "../Components/EmployeeCard";
import SummaryView from "../Components/SummaryView";
import EmptyState from "../Components/EmptyState";
import LoadingSpinner from "../Components/LoadingSpinner";

import { useApi } from "../Hooks/useApi";
import { COLORS, SHADOWS, primaryGradient } from "../Utils/colors";

import MyEmployees from "./MyEmployees";
import AddEmployee from "./AddEmployee";
import RemoveEmployee from "./RemoveEmployee";
import ActivityLogs from "./ActivityLogs";
import SuspiciousReports from "./SuspiciousReports";
import Settings from "./Settings";
import AdminProfile from "./AdminProfile";

function Dashboard({ user, role, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);

  const {
    callApi: fetchOverview,
    loading: loadingList,
    error: listError,
  } = useApi();
  const {
    callApi: fetchSummary,
    loading: loadingSummary,
    error: summaryError,
  } = useApi();
  const {
    callApi: fetchActivity,
    loading: loadingActivity,
    error: activityError,
  } = useApi();

  /* ---------- load overview list ---------- */

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await fetchOverview(`/overview?date_str=${date}`);

        const employeesWithDerived = Array.isArray(data)
          ? data.map((emp) => ({
              ...emp,
              isActive: emp.status === "Active",
            }))
          : [];

        setEmployees(employeesWithDerived);

        if (
          !selectedId ||
          !employeesWithDerived?.find(
            (emp) => emp.employee_id === selectedId
          )
        ) {
          setSelectedId(employeesWithDerived?.[0]?.employee_id || null);
        }
      } catch (err) {
        console.error(err);
        setEmployees([]);
        setSelectedId(null);
      }
    };

    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  /* ---------- load summary when selection changes ---------- */

  useEffect(() => {
    if (!selectedId) {
      setSummary(null);
      return;
    }

    const loadSummary = async () => {
      try {
        const data = await fetchSummary(
          `/summary/${selectedId}?date_str=${date}`
        );
        setSummary(data);
      } catch (err) {
        console.error(err);
        setSummary(null);
      }
    };

    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, date]);

  /* ---------- load activity logs when Activity Logs page open ---------- */

  useEffect(() => {
    if (activePage !== "activity-logs" || !selectedId) {
      setActivityLogs([]);
      return;
    }

    const loadActivity = async () => {
      try {
        const data = await fetchActivity(
          `/activity/${selectedId}?date_str=${date}`
        );
        setActivityLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setActivityLogs([]);
      }
    };

    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, selectedId, date]);

  /* ---------- derived data ---------- */

  const stats = useMemo(
    () =>
      employees.reduce(
        (acc, emp) => ({
          total: acc.total + 1,
          active: acc.active + (emp.status === "Active" ? 1 : 0),
          suspicious: acc.suspicious + (emp.suspicious_flag_count || 0),
        }),
        { total: 0, active: 0, suspicious: 0 }
      ),
    [employees]
  );

  const selectedEmployee = useMemo(
    () => employees.find((emp) => emp.employee_id === selectedId),
    [employees, selectedId]
  );

  const handleOpenActivityLogs = useCallback((employeeId) => {
    setSelectedId(employeeId);
    setActivePage("activity-logs");
  }, []);

  /* ---------- render ---------- */

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <Sidebar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role={role}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header
          style={{
            background: "white",
            padding: "16px 24px",
            boxShadow: SHADOWS.sm,
            borderBottom: `1px solid ${COLORS.gray[200]}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: primaryGradient,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
                boxShadow: SHADOWS.md,
              }}
            >
              N
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: COLORS.gray[900],
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                }}
              >
                {activePage === "dashboard"
                  ? "TeamPulse Dashboard"
                  : activePage === "employees"
                  ? "My Employees"
                  : activePage === "add-employee"
                  ? "Add Employee"
                  : activePage === "remove-employee"
                  ? "Remove Employee"
                  : activePage === "activity-logs"
                  ? "Activity Logs"
                  : activePage === "suspicious"
                  ? "Suspicious Reports"
                  : activePage === "settings"
                  ? "Settings"
                  : "Admin Profile"}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: COLORS.gray[500],
                }}
              >
                {user?.username} •{" "}
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.gray[300]}`,
                  background: "white",
                  color: COLORS.gray[900],
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                  width: 160,
                }}
              />
            </div>
          </div>
        </header>

        {/* Page content switch */}
        {activePage === "dashboard" && (
          <DashboardHome
            stats={stats}
            employees={employees}
            loadingList={loadingList}
            listError={listError}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            summary={summary}
            loadingSummary={loadingSummary}
            summaryError={summaryError}
            selectedEmployee={selectedEmployee}
            onViewActivityLogs={handleOpenActivityLogs}
          />
        )}

        {activePage === "employees" && (
          <MyEmployees
            employees={employees}
            loading={loadingList}
            error={listError}
            onSelect={(id) => {
              setSelectedId(id);
              setActivePage("dashboard");
            }}
            onViewActivityLogs={handleOpenActivityLogs}
          />
        )}

        {activePage === "add-employee" && <AddEmployee />}

        {activePage === "remove-employee" && (
          <RemoveEmployee employees={employees} />
        )}

        {activePage === "activity-logs" && (
          <ActivityLogs
            employees={employees}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            activityLogs={activityLogs}
            loading={loadingActivity}
            error={activityError}
            date={date}
          />
        )}

        {activePage === "suspicious" && (
          <SuspiciousReports employees={employees} />
        )}

        {activePage === "settings" && <Settings />}

        {activePage === "profile" && <AdminProfile user={user} />}
      </div>
    </div>
  );
}

/* ========== dashboard home (main cards + summary) ========== */

function DashboardHome({
  stats,
  employees,
  loadingList,
  listError,
  selectedId,
  setSelectedId,
  summary,
  loadingSummary,
  summaryError,
  selectedEmployee,
  onViewActivityLogs,
}) {
  return (
    <>
      {/* Stats Overview */}
      <div style={{ padding: "24px 24px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <StatCard label="Total Employees" value={stats.total} icon="👥" />
          <StatCard
            label="Active Now"
            value={stats.active}
            valueColor={COLORS.success[600]}
            icon="🟢"
          />
          <StatCard
            label="Suspicious Flags"
            value={stats.suspicious}
            valueColor={COLORS.error[600]}
            icon="🚩"
          />
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          padding: "0 24px 24px",
          display: "grid",
          gridTemplateColumns: "minmax(300px, 380px) 1fr",
          gap: 24,
          height: "calc(100vh - 180px)",
        }}
      >
        {/* LEFT: employee list */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: SHADOWS.md,
            border: `1px solid ${COLORS.gray[200]}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: `1px solid ${COLORS.gray[200]}`,
              background: COLORS.gray[50],
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                color: COLORS.gray[900],
                fontWeight: 600,
              }}
            >
              Employees Overview
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: COLORS.gray[500],
              }}
            >
              {employees.length} employee
              {employees.length !== 1 ? "s" : ""} found • {stats.active} active
            </p>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "100%",
            }}
          >
            {loadingList ? (
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
            ) : listError ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: COLORS.error[600],
                  fontSize: 14,
                }}
              >
                Failed to load employees
              </div>
            ) : employees.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: COLORS.gray[500],
                  fontSize: 14,
                }}
              >
                No employees found for this date.
              </div>
            ) : (
              employees.map((emp) => {
                const isSelected = emp.employee_id === selectedId;
                return (
                  <EmployeeCard
                    key={emp.employee_id}
                    employee={emp}
                    isSelected={isSelected}
                    onClick={() => setSelectedId(emp.employee_id)}
                    onViewActivity={onViewActivityLogs}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: summary */}
        <div
          style={{
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
              icon="👥"
              title="Select an Employee"
              description="Choose an employee from the list to view detailed analytics and activity data."
            />
          ) : loadingSummary ? (
            <div
              style={{
                padding: 60,
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
              Loading employee details...
            </div>
          ) : summaryError ? (
            <EmptyState
              icon="❌"
              title="Failed to Load Details"
              description="Unable to load employee details. Please try again."
            />
          ) : summary ? (
            <SummaryView
              summary={summary}
              employee={selectedEmployee}
              onViewActivity={() =>
                onViewActivityLogs(summary.employee_id)
              }
            />
          ) : (
            <EmptyState
              icon="📊"
              title="No Data Available"
              description="No detailed information available for this employee on the selected date."
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
