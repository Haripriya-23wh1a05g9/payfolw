

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Layout.css";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/employees/getAll");
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        setError(err.message || "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Placeholder for delete action (not implemented)
  const handleDelete = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
        <h2 className="text-2xl font-semibold mb-4">Employee List</h2>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="spinner" style={{ width: 22, height: 22, border: "3px solid #b2f5ea", borderTop: "3px solid #4fd1c5", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8, display: "inline-block" }}></span>
            Loading employees...
          </div>
        ) : error ? (
          <div role="alert" style={{ color: "#ef4444", fontWeight: 600 }}>{error}</div>
        ) : (
          <table aria-label="Employee list" style={{ width: "100%", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #e2e8f0", overflow: "hidden" }}>
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                <th style={{ padding: 12, textAlign: "left" }}>Age</th>
                <th style={{ padding: 12, textAlign: "left" }}>Experience (yrs)</th>
                <th style={{ padding: 12, textAlign: "left" }}>Onboarded</th>
                <th style={{ padding: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td style={{ padding: 12 }}>{emp.name}</td>
                  <td style={{ padding: 12 }}>{emp.age}</td>
                  <td style={{ padding: 12 }}>{emp.experience}</td>
                  <td style={{ padding: 12 }}>{emp.onboarded || "-"}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => handleDelete(emp.id)} aria-label={`Delete ${emp.name}`} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.target.style.background = "#dc2626"} onMouseOut={e => e.target.style.background = "#ef4444"}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          main {
            margin-left: 0 !important;
            padding: 10px !important;
          }
          table {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </div>
  );
}
