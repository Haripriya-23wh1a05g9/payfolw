// src/pages/ManagerDashboard.jsx
import React from "react";
import "../styles/Layout.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../authContext.jsx";
import { Link } from "react-router-dom";

export default function ManagerDashboard() {
  const { user } = useAuth();
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Manager Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "18px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src="/vite.svg" alt="logo" style={{ width: 38, height: 38, marginRight: 10 }} />
          <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1a2233" }}>Manager Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontWeight: 600, color: "#1a2233" }}>Welcome, {user?.username || "Manager"}</span>
          <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          {/* Logout button removed; handled by Sidebar */}
        </div>
      </nav>
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
          <h2 className="text-2xl font-semibold mb-4">Manager Panel</h2>
          <p>Welcome Manager, oversee your assigned responsibilities.</p>
          <div style={{ marginTop: 32 }}>
            <Link
              to="/Employee/AddEmployee/add"
              style={{
                background: "#4fd1c5",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "1rem"
              }}
            >
              Add Employee
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
