import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Fallback: get user from localStorage if context is not set
  let localUser = user;
  if (!localUser) {
    try {
      localUser = JSON.parse(localStorage.getItem("payflow_user"));
    } catch {
      localUser = null;
    }
  }

  // Enhanced logout: clear localStorage and redirect
  const handleLogout = async () => {
    let url =
      localUser && localUser.role === "admin"
        ? "/api/admins/logout"
        : "/api/users/logout";
    try {
      // Call Spring Boot logout endpoint
      await fetch(url, {
        method: "POST",
        credentials: "include", // include cookies if using session auth
      });
    } catch (err) {
      // Optionally handle error
      console.error("Logout API failed", err);
    }
    console.log("Logging out user:", localUser, "via API:", url);
    // Clear user data from localStorage
    localStorage.removeItem("payflow_user");
    logout();
    window.location.href = "/login";
  };

  return (
    <aside
      className="sidebar"
      style={{
        background: "#fff",
        minWidth: 220,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: "32px 0",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ width: "100%" }}>
        <h2
          className="sidebar-title"
          style={{
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#1a2233",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          PayFlow AI
        </h2>
        <nav style={{ width: "100%" }}>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              width: "100%",
            }}
          >
            {localUser && localUser.role === "admin" && (
              <li>
                <Link
                  to="/admin"
                  style={{
                    display: "block",
                    padding: "12px 32px",
                    color: "#4fd1c5",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Admin Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/employees"
                style={{
                  display: "block",
                  padding: "12px 32px",
                  color: "#1a2233",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Employees
              </Link>
            </li>
            <li>
              <Link
                to="/leaves"
                style={{
                  display: "block",
                  padding: "12px 32px",
                  color: "#1a2233",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Leaves
              </Link>
            </li>
            <li>
              <Link
                to="/payroll"
                style={{
                  display: "block",
                  padding: "12px 32px",
                  color: "#1a2233",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Payroll
              </Link>
            </li>
            <li>
              <Link
                to="/payslips"
                style={{
                  display: "block",
                  padding: "12px 32px",
                  color: "#1a2233",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Payslips
              </Link>
            </li>
            {localUser && (
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "12px 32px",
                    width: "100%",
                    textAlign: "left",
                    fontSize: "1.1rem",
                    marginTop: 18,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 2px 8px rgba(239,68,68,0.09)",
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;