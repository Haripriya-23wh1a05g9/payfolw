import React, { useState, useEffect, useCallback } from "react";
import { FaUserPlus, FaUserShield, FaHome, FaUsers, FaSignOutAlt } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import "../styles/Layout.css";

function InfoCard({ title, value, icon, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: "1.7rem", color }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1a2233" }}>{title}</span>
      <span style={{ fontWeight: 600, fontSize: "1.5rem", color: "#4fd1c5" }}>{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "hr" });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/users/getAllUsers");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
    console.log("Fetched users:", data, "isArray :",Array.isArray(data));
    // If your backend returns { users: [...] }
    const usersArray = Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []);
    setUsers(usersArray);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      setUsers([]); // Always set to array to avoid crash
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add HR/Manager via API
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role.toUpperCase(),
          createdBy: 1 // or get from auth context
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("duplicate")) {
          throw new Error("Email or username already exists. Please use a different one.");
        }
        throw new Error("Registration failed");
      }
      const newUser = await res.json();
      setCreated(newUser);
      setForm({ username: "", email: "", password: "", role: "hr" });
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Enable/Disable user via API
  const handleToggleStatus = async id => {
    setError("");
    setLoading(true);
    try {
      const user = users.find(u => u.id === id);
      if (!user) throw new Error("User not found");
      const newStatus = user.status === "disabled" ? "active" : "disabled";
      const res = await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update user status");
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  // Always use a safe array for rendering
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "18px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: "1.7rem", fontWeight: 700, color: "#1a2233", display: "flex", alignItems: "center", gap: 8 }}><FaHome /> Dashboard</span>
          <span style={{ fontSize: "1.2rem", color: "#4fd1c5", display: "flex", alignItems: "center", gap: 8 }}><FaUsers /> Manage Users</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontWeight: 600, color: "#1a2233" }}>Welcome, Admin</span>
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontWeight: 500, color: "#64748b", fontSize: "1.1rem" }}>{new Date().toLocaleTimeString()}</span>
          <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><FaSignOutAlt /> Logout</button>
        </div>
      </nav>
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
          {error && <div style={{ color: "#ef4444", marginBottom: 16 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
            <InfoCard title="Total Active Users" value={safeUsers.filter(u => u.status !== "disabled").length} icon={<FaUsers />} color="#4fd1c5" />
            <InfoCard title="Total HRs" value={safeUsers.filter(u => u.role === "hr").length} icon={<FaUserShield />} color="#38bdf8" />
            <InfoCard title="Total Managers" value={safeUsers.filter(u => u.role === "manager").length} icon={<FaUserPlus />} color="#fbbf24" />
            <InfoCard title="Disabled Users" value={safeUsers.filter(u => u.status === "disabled").length} icon={<FaSignOutAlt />} color="#ef4444" />
            <InfoCard title="Current Date" value={new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} icon={<FaHome />} color="#64748b" />
          </div>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><FaUserPlus /> Create HR/Manager Account</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input name="username" value={form.username} onChange={handleChange} required placeholder="Full Name" style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
              <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }} />
              <select name="role" value={form.role} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <option value="hr">HR</option>
                <option value="manager">Manager</option>
              </select>
              <input name="password" value={form.password} onChange={handleChange} required type="text" placeholder="Set Password" style={{ padding: 10, borderRadius: 6, border: "1px solid #e2e8f0", marginTop: 12 }} />
              <button 
                style={{
                  background: loading ? "#b2f5ea" : "#4fd1c5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "12px 0",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  cursor: loading ? "not-allowed" : "pointer"
                }} 
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
            {error && <div style={{ color: "#ef4444", marginTop: 12 }}>{error}</div>}
            {created && (
              <div style={{ marginTop: 20, background: "#406a94ff", padding: 16, borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Account Created!</div>
                <div><b>Name:</b> {created.username}</div>
                <div><b>Role:</b> {created.role}</div>
                <div><b>Email:</b> {created.email}</div>
                <div><b>Password:</b> {created.password}</div>
                <div style={{ fontSize: 13, color: "#ecf3fdff", marginTop: 8 }}>
                  Share these credentials with the new user.
                </div>
                <button style={{ marginTop: 12, background: "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }} onClick={() => setCreated(null)}>OK</button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 40, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 32, maxWidth: 900, margin: "40px auto" }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><FaUsers /> User List</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#2e4d6cff" }}>
                  <th style={{ padding: 10, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Role</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Email</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 10, textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {safeUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: 20, color: "#0e1115ff" }}>No users found. Please add a user.</td>
                  </tr>
                ) : (
                  safeUsers.map(u => (
                    <tr key={u.userId || u.email}>
                      <td style={{ padding: 10, color: "black"}}>{u.username || "N/A"}</td>
                      <td style={{ padding: 10, color: "black" }}>{u.role || "N/A"}</td>
                      <td style={{ padding: 10, color: "black" }}>{u.email || "N/A"}</td>
                      <td style={{ padding: 10, color: "black" }}>{u.status === "disabled" ? "Disabled" : "Active"}</td>
                      <td style={{ padding: 10 }}>
                        {u.status === "disabled" ? (
                          <button style={{ background: "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 500, cursor: "pointer" }} onClick={() => handleToggleStatus(u.userId)}>Enable</button>
                        ) : (
                          <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 500, cursor: "pointer" }} onClick={() => handleToggleStatus(u.id)}>Disable</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}