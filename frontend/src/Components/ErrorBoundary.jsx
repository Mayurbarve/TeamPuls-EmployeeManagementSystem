import { COLORS } from "../Utils/colors";
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 40,
            background: COLORS.error[50],
            borderRadius: 12,
            border: `1px solid ${COLORS.error[200]}`,
            textAlign: "center",
          }}
        >
          <h3 style={{ color: COLORS.error[600] }}>Something went wrong.</h3>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "8px 14px",
              background: COLORS.primary[500],
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
