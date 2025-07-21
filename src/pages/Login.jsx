import React, { useState } from "react";
import "../styles/form.css";
import Navbar from "../components/Navbar";
import { FaUserShield, FaUser, FaLock, FaSignInAlt } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // 'admin' or 'user'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let url = role === "admin" ? "/api/admins/login" : "/api/users/login";
    console.log("Logging in with:", { email, password, role });
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await res.json();
      // Save user/admin info to localStorage for session
      localStorage.setItem("payflow_user", JSON.stringify(data));
      // Redirect to dashboard or onboarding
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        // If employee and not onboarded, redirect to onboarding form
        if (data.requiresPasswordReset == true) {
          window.location.href = "/reset";
          return;
        }
        console.log("User data:", data);
        if (data.role === "EMPLOYEE" && !data.onboarded) {
          window.location.href = "/onboarding";
        } else if (data.role === "HR") {
          window.location.href = "/hr";
        } else if (data.role === "MANAGER") {
          window.location.href = "/manager";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(120deg,#f8fafc 60%,#4fd1c5 100%)" }}>
      <Navbar />
      <div className="form-container" style={{
        maxWidth: 440,
        margin: "56px auto",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(79,209,197,0.13)",
        padding: 44,
        position: "relative",
        overflow: "hidden",
        animation: "fadeIn 0.7s"
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, opacity: 0.12 }}>
          <FaSignInAlt style={{ fontSize: 120, color: "#4fd1c5" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, justifyContent: "center" }}>
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 8px #4fd1c5" }} />
          <div>
            <h2 style={{ color: "#1a2233", fontWeight: 800, fontSize: "2.1rem", marginBottom: 2 }}>Welcome Back!</h2>
            <div style={{ color: "#64748b", fontWeight: 500, fontSize: "1.05rem" }}>Sign in to your PayFlow account</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }} aria-label="Login form">
          <div style={{ display: "flex", gap: 10, marginBottom: 2 }}>
            <label htmlFor="role-user" style={{ flex: 1, cursor: "pointer", fontWeight: 500 }}>
              <input id="role-user" type="radio" name="role" value="user" checked={role === "user"} onChange={e => setRole(e.target.value)} style={{ marginRight: 6 }} aria-checked={role === "user"} aria-label="User (HR/Manager/Employee)" />
              <FaUser style={{ marginRight: 4, color: "#38bdf8" }} /> User (HR/Manager/Employee)
            </label>
            <label htmlFor="role-admin" style={{ flex: 1, cursor: "pointer", fontWeight: 500 }}>
              <input id="role-admin" type="radio" name="role" value="admin" checked={role === "admin"} onChange={e => setRole(e.target.value)} style={{ marginRight: 6 }} aria-checked={role === "admin"} aria-label="Admin" />
              <FaUserShield style={{ marginRight: 4, color: "#fbbf24" }} /> Admin
            </label>
          </div>
          <div style={{ position: "relative" }}>
            <FaUser style={{ position: "absolute", left: 12, top: 14, color: "#4fd1c5" }} />
            <input id="email" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 36, marginBottom: 0, width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", height: 46, fontSize: "1.08rem" }} aria-required="true" aria-label="Email" />
          </div>
          <div style={{ position: "relative" }}>
            <FaLock style={{ position: "absolute", left: 12, top: 14, color: "#4fd1c5" }} />
            <input id="password" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: 36, marginBottom: 0, width: "100%", borderRadius: 8, border: "1px solid #e2e8f0", height: 46, fontSize: "1.08rem" }} aria-required="true" aria-label="Password" />
          </div>
          <button type="submit" style={{
            background: loading ? "#b2f5ea" : "#4fd1c5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "16px 0",
            width: "100%",
            fontWeight: 800,
            fontSize: "1.18rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 2px 12px rgba(79,209,197,0.13)",
            transition: "background 0.2s"
          }} disabled={loading} aria-busy={loading} aria-label="Login">
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 22, height: 22, border: "3px solid #b2f5ea", borderTop: "3px solid #4fd1c5", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8 }}></span>
                Logging in...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><FaSignInAlt /> Login</span>
            )}
          </button>
        </form>
        {error && <div role="alert" style={{ color: "#e53e3e", marginTop: 18, textAlign: "center", fontWeight: 700, fontSize: "1.08rem", letterSpacing: 0.2 }}>{error === "Invalid credentials" ? "Incorrect email or password. Please try again." : error}</div>}
        <div className="form-links" style={{ marginTop: 32, display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 500 }}>
          <a href="/reset" style={{ color: "#4fd1c5", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#38bdf8"} onMouseOut={e => e.target.style.color = "#4fd1c5"}>Forgot Password?</a>
          <a href="/register" style={{ color: "#4fd1c5", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#38bdf8"} onMouseOut={e => e.target.style.color = "#4fd1c5"}>Register</a>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .form-container {
            max-width: 98vw !important;
            margin: 16px auto !important;
            padding: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}