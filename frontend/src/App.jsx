// src/App.jsx
import React, { useEffect, useState, useCallback } from "react";
import Dashboard from "./Pages/Dashboard";
import { useApi } from "./Hooks/useApi";
import ErrorBoundary from "./Components/ErrorBoundary";
import LoadingSpinner from "./Components/LoadingSpinner";
import LandingPage from "./Pages/LandingPage";
import DocsPage from "./Pages/DocsPage";
import "./Pages/AdminLogin.css";

function App() {
  const [authPage, setAuthPage] = useState(() => window.location.pathname === "/signup" ? "signup" : window.location.pathname === "/admin" ? "login" : window.location.pathname === "/docs" ? "docs" : "home");
  const [token, setToken] = useState(() =>
    localStorage.getItem("teampulse_token")
  );
  const [role, setRole] = useState(() => localStorage.getItem("teampulse_role"));
  const [user, setUser] = useState(null);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem("teampulse_token")));

  const { callApi: fetchUser } = useApi();

  const navigate = useCallback((page, { replace = false } = {}) => {
    const path = page === "signup" ? "/signup" : page === "login" ? "/admin" : page === "docs" ? "/docs" : page === "download" ? "/#download" : "/";
    const updateHistory = replace ? window.history.replaceState : window.history.pushState;
    updateHistory.call(window.history, {}, "", path);
    setAuthPage(page === "download" ? "home" : page);
  }, []);

  const handleLogout = useCallback(() => {
    navigate("login");
    setToken(null);
    setRole(null);
    setUser(null);
    setIsDashboardVisible(false);
    localStorage.removeItem("teampulse_token");
    localStorage.removeItem("teampulse_role");
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => {
      const page = window.location.pathname === "/signup" ? "signup" : window.location.pathname === "/admin" ? "login" : window.location.pathname === "/docs" ? "docs" : "home";
      setAuthPage(page);
      if (page !== "login") setIsDashboardVisible(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.addEventListener("teampulse:unauthorized", handleLogout);
    return () => window.removeEventListener("teampulse:unauthorized", handleLogout);
  }, [handleLogout]);

  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    const loadUser = async () => {
      setCheckingSession(true);
      try {
        const data = await fetchUser("/auth/me");
        if (data?.username) {
          setUser(data);
          setRole(data.role);
          localStorage.setItem("teampulse_role", data.role);
        } else {
          throw new Error("Invalid user data received");
        }
      } catch {
        handleLogout();
      } finally {
        setCheckingSession(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogin = useCallback((newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    setIsDashboardVisible(true);
    localStorage.setItem("teampulse_token", newToken);
    localStorage.setItem("teampulse_role", newRole);
  }, []);

  // Keep the public home page as the startup view, even when an admin session is remembered.
  // Only show the dashboard after a successful sign-in in this app session.
  if (!isDashboardVisible || !token || !role) {
    return (
      <ErrorBoundary>
        {authPage === "login" ? <Login onLogin={handleLogin} onBack={() => navigate("home", { replace: true })} onSignUp={() => navigate("signup")} />
          : authPage === "signup" ? <SignUp onBack={() => navigate("home", { replace: true })} onSignIn={() => navigate("login")} />
          : authPage === "docs" ? <DocsPage onBack={() => navigate("home", { replace: true })} onDownload={() => navigate("download")} />
          : <LandingPage onAdminLogin={() => navigate("login")} onDocs={() => navigate("docs")} />}
      </ErrorBoundary>
    );
  }

  if (checkingSession || !user) return <LoadingSpinner size={32} />;

  // logged in
  return (
    <ErrorBoundary>
      <Dashboard user={user} role={role} onLogout={handleLogout} />
    </ErrorBoundary>
  );
}

/* ========================= LOGIN COMPONENT ========================= */

function Login({ onLogin, onBack, onSignUp }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { callApi, loading, error, setError } = useApi();

  const handleChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      if (error) setError(null);
    },
    [error, setError]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const data = await callApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      });

      if (data?.access_token) {
        onLogin(data.access_token, data.role);
      } else {
        throw new Error(data?.detail || "Authentication failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      // error message hook me already set ho jayega
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-orb admin-login-orb-top" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb-bottom" aria-hidden="true" />
      <div className="admin-login-shell">
        <header className="admin-login-header">
          <a className="admin-login-logo" href="#home" onClick={(event) => { event.preventDefault(); onBack(); }} aria-label="TeamPulse home">T</a>
          <div className="admin-login-brand-name">TEAMPULSE ADMIN</div>
          <p>Secure Management Dashboard</p>
        </header>

        <section className="admin-login-card">
          <div className="admin-login-title">
            <h1>Welcome Back</h1>
            <span />
            <p>Sign in to your TeamPulse dashboard</p>
          </div>

          {error && <div className="admin-login-error" role="alert"><span>⚠</span>{error}</div>}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <label htmlFor="admin-username">Username</label>
            <div className="admin-input-wrap"><span aria-hidden="true">👤</span><input id="admin-username" autoComplete="username" value={formData.username} onChange={handleChange("username")} placeholder="Enter your username" required disabled={loading} /></div>
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrap"><span aria-hidden="true">🔒</span><input id="admin-password" type="password" autoComplete="current-password" value={formData.password} onChange={handleChange("password")} placeholder="Enter your password" required disabled={loading} /></div>
            <button className="admin-sign-in" type="submit" disabled={loading}>
              {loading ? <LoadingSpinner size={16} color="white" /> : <><span aria-hidden="true">→</span> Sign In</>}
            </button>
          </form>

          <div className="admin-login-divider"><span />or<span /></div>
          <button className="admin-signup-link" type="button" onClick={onSignUp}>Don&apos;t have an account? <strong>Sign up →</strong></button>
          <button className="admin-back-home" type="button" onClick={onBack}><span>←</span> Back to TeamPulse Home</button>
        </section>
      </div>
    </main>
  );
}

function SignUp({ onBack, onSignIn }) {
  const [formData, setFormData] = useState({ username: "", password: "", role: "admin" });
  const [notice, setNotice] = useState("");
  const { callApi, loading, error } = useApi();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    try {
      await callApi("/auth/signup", { method: "POST", body: JSON.stringify(formData) });
      setNotice("Account created. Sign in with your new credentials.");
      window.setTimeout(onSignIn, 700);
    } catch {
      // The API hook exposes the request failure below.
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-orb admin-login-orb-top" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb-bottom" aria-hidden="true" />
      <div className="admin-login-shell">
        <header className="admin-login-header">
          <a className="admin-login-logo" href="/" onClick={(event) => { event.preventDefault(); onBack(); }} aria-label="TeamPulse home">T</a>
          <div className="admin-login-brand-name">TEAMPULSE ADMIN</div>
          <p>Secure Management Dashboard</p>
        </header>
        <section className="admin-login-card">
          <div className="admin-login-title"><h1>Create Account</h1><span /><p>Sign up for the TeamPulse Admin Panel</p></div>
          {error && <div className="admin-login-error" role="alert"><span>⚠</span>{error}</div>}
          {notice && <div className="admin-signup-success" role="status">{notice}</div>}
          <form onSubmit={handleSubmit} className="admin-login-form">
            <label htmlFor="signup-username">Username</label>
            <div className="admin-input-wrap"><span aria-hidden="true">👤</span><input id="signup-username" autoComplete="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Enter your username" minLength={1} maxLength={80} required disabled={loading} /></div>
            <label htmlFor="signup-password">Password</label>
            <div className="admin-input-wrap"><span aria-hidden="true">🔒</span><input id="signup-password" type="password" autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Create a password (12+ characters)" minLength={12} maxLength={128} required disabled={loading} /></div>
            <label htmlFor="signup-role">Role</label>
            <div className="admin-input-wrap"><span aria-hidden="true">◈</span><select id="signup-role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} disabled={loading}><option value="admin">Admin</option><option value="manager">Manager</option></select></div>
            <button className="admin-sign-in" type="submit" disabled={loading || Boolean(notice)}>{loading ? <LoadingSpinner size={16} color="white" /> : "Create Account"}</button>
          </form>
          <div className="admin-login-divider"><span />or<span /></div>
          <button className="admin-signup-link" type="button" onClick={onSignIn}>Already have an account? <strong>Sign in</strong></button>
          <button className="admin-back-home" type="button" onClick={onBack}><span>←</span> Back to TeamPulse Home</button>
        </section>
      </div>
    </main>
  );
}

export default App;
