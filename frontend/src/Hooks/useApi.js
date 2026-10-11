// src/hooks/useApi.js
import { useState, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("teampulse_token")
            ? { Authorization: `Bearer ${localStorage.getItem("teampulse_token")}` }
            : {}),
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401 && localStorage.getItem("teampulse_token") && endpoint !== "/auth/login") {
          window.dispatchEvent(new Event("teampulse:unauthorized"));
        }
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.detail || `Request failed (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callApi, loading, error, setError };
}
