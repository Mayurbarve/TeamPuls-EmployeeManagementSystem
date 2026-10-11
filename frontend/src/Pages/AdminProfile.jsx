import React from "react";
import { COLORS, SHADOWS } from "../Utils/colors";

function AdminProfile({ user }) {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          maxWidth: 520,
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
          Admin Profile
        </h3>
        <p
          style={{
            fontSize: 13,
            color: COLORS.gray[500],
            marginBottom: 16,
          }}
        >
          Basic profile information for the logged-in admin or manager.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                color: COLORS.gray[500],
                marginBottom: 4,
              }}
            >
              Username
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.gray[900],
              }}
            >
              {user?.username || "-"}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                color: COLORS.gray[500],
                marginBottom: 4,
              }}
            >
              Role
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.gray[900],
              }}
            >
              {user?.role || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
