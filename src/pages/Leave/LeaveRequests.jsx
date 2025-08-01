
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../authContext.jsx";
import { FaCalendarAlt, FaHome, FaUser, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Layout.css";

const palette = {
  blue: "#93c5fd",      // subtle blue (same as admin)
  teal: "#99f6e4",      // subtle teal (same as admin)
  yellow: "#fde68a",    // subtle yellow (same as admin)
  orange: "#fdba74",    // subtle orange (same as admin)
  red: "#ef4444",       // bright red (same as admin)
  green: "#22c55e",     // bright green (same as admin)
  purple: "#ddd6fe",    // subtle purple (same as admin)
  gray: "#9ca3af",      // darker gray for better visibility
  dark: "#374151",      // darker text for better readability
  darkest: "#1f2937",   // darkest text for high contrast
  light: "#f8fafc",     // same as admin
  accent: "#6366f1",    // same as admin
  bg: "#f1f5f9",        // same as admin
  white: "#fff",        // same as admin
};

export default function LeaveRequests() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

    // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      // Get user data
      const userData = localStorage.getItem("payflow_user");
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user) {
        setError("Please login to view leave requests");
        toast.error("Please login first", { position: "top-center" });
        setTimeout(() => window.location.href = "/login", 2000);
        return;
      }
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header if user token exists
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
      
      let response;
      try {
        // Try primary API endpoint
        response = await fetch("/api/leaves/all", {
          method: "GET",
          credentials: "include",
          headers,
        });
        
        // If 401/403, try with session authentication only
        if (response.status === 401 || response.status === 403) {
          response = await fetch("/api/leaves/all", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      } catch (err) {
        console.log("Primary API failed, using mock data for development...", err);
        
        // Fallback to mock data for development/testing
        const mockLeaveRequests = [
          {
            id: 1,
            employeeId: 1,
            employeeName: "John Doe",
            startDate: "2025-07-30",
            endDate: "2025-08-01",
            reason: "Family vacation",
            status: "pending",
            createdAt: "2025-07-27T10:00:00Z"
          },
          {
            id: 2,
            employeeId: 2,
            employeeName: "Jane Smith", 
            startDate: "2025-08-05",
            endDate: "2025-08-07",
            reason: "Medical appointment",
            status: "pending",
            createdAt: "2025-07-27T11:00:00Z"
          },
          {
            id: 3,
            employeeId: 3,
            employeeName: "Mike Johnson",
            startDate: "2025-07-25",
            endDate: "2025-07-26",
            reason: "Personal emergency",
            status: "approved",
            createdAt: "2025-07-25T09:00:00Z"
          }
        ];
        
        setTimeout(() => {
          setLeaveRequests(mockLeaveRequests);
          setError(null);
          setLoading(false);
        }, 1000);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(Array.isArray(data) ? data : []);
        setError(null);
      } else if (response.status === 401) {
        setError("Session expired. Please login again.");
        toast.error("Session expired. Please login again.", { position: "top-center" });
        setTimeout(() => {
          localStorage.removeItem("payflow_user");
          window.location.href = "/login";
        }, 2000);
      } else if (response.status === 403) {
        setError("Access denied. You don't have permission to view leave requests.");
        toast.error("Access denied", { position: "top-center" });
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        setError("Failed to fetch leave requests");
        toast.error("Failed to fetch leave requests", { position: "top-center" });
      }
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError("Network error. Please check your connection.");
      toast.error("Network error loading leave requests", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Handle approve/reject leave request
  const handleLeaveAction = async (leaveId, action) => {
    setProcessingIds(prev => new Set([...prev, leaveId]));
    
    try {
      const status = action === "approve" ? "APPROVED" : "REJECTED";
      const response = await fetch(`/api/leaves/${leaveId}/status?status=${status}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(`Leave request ${action}d successfully!`, { position: "top-center" });
        // Refresh the list
        fetchLeaveRequests();
      } else {
        const errorText = await response.text();
        toast.error(errorText || `Failed to ${action} leave request`, { position: "top-center" });
      }
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error);
      toast.error(`Error ${action}ing leave request`, { position: "top-center" });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return palette.green;
      case 'REJECTED':
        return palette.red;
      case 'PENDING':
        return palette.orange;
      default:
        return palette.gray;
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span
        style={{
          background: color,
          color: palette.white,
          padding: "4px 12px",
          borderRadius: 12,
          fontSize: "0.85rem",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {status || "PENDING"}
      </span>
    );
  };

  const calculateLeaveDays = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: `linear-gradient(120deg, ${palette.bg} 60%, #e0f2fe 100%)`,
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: palette.white,
          padding: "22px 40px 18px 40px",
          boxShadow: "0 4px 18px 0 rgba(36,37,38,0.06)",
          borderBottom: `1.5px solid ${palette.bg}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: palette.accent,
              display: "flex",
              alignItems: "center",
              gap: 10,
              letterSpacing: 0.5,
            }}
          >
            <FaCalendarAlt /> Leave Requests
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontWeight: 700, color: palette.darkest, fontSize: "1.1rem", letterSpacing: 0.2 }}>
            Welcome, {user?.username || "HR"}
          </span>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${palette.accent} 0%, #8b5cf6 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2.5px solid ${palette.accent}`,
              color: palette.white,
              fontSize: "1.2rem",
            }}
          >
            <FaUser />
          </div>
          <span
            style={{
              fontWeight: 700,
              color: palette.accent,
              fontSize: "1.25rem",
              letterSpacing: 1.5,
              background: "linear-gradient(90deg, #f1f5f9 60%, #e0e7ef 100%)",
              borderRadius: 8,
              padding: "6px 18px",
              boxShadow: "0 2px 8px #6366f122",
              fontFamily: "monospace, 'Roboto Mono', 'Fira Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
              minWidth: 110,
              textAlign: "center",
              border: `1.5px solid ${palette.accent}22`,
              marginLeft: 8,
              transition: "background 0.2s",
            }}
          >
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ padding: "2.5rem 2rem", width: "100%" }}>
          <div
            style={{
              background: palette.white,
              borderRadius: 20,
              boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
              padding: 36,
              border: `1.5px solid ${palette.accent}22`,
            }}
          >
            <h2
              style={{
                fontWeight: 800,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: palette.accent,
                fontSize: "1.5rem",
                letterSpacing: 0.2,
              }}
            >
              <FaCalendarAlt /> All Leave Requests
            </h2>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <FaSpinner 
                  style={{ 
                    fontSize: "2rem", 
                    color: palette.accent, 
                    animation: "spin 1s linear infinite" 
                  }} 
                />
                <p style={{ color: palette.accent, fontWeight: 600, marginTop: 16 }}>
                  Loading leave requests...
                </p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.red, fontWeight: 600, fontSize: "1.1rem" }}>{error}</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.gray, fontWeight: 600, fontSize: "1.1rem" }}>
                  No leave requests found.
                </p>
              </div>
            ) : (
              <div style={{ width: "100%" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    fontSize: "1rem",
                    color: palette.darkest,
                    background: "transparent",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px #6366f111",
                    border: `2px solid ${palette.accent}22`,
                  }}
                >
                  <thead
                    style={{
                      background: `${palette.accent}11`,
                      borderBottom: `2.5px solid ${palette.accent}`,
                      textAlign: "left",
                    }}
                  >
                    <tr>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Employee</th>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Start Date</th>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>End Date</th>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Days</th>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Reason</th>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Status</th>
                      <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request, idx) => (
                      <tr
                        key={request.id}
                        style={{
                          borderBottom: "1.5px solid #64748b33",
                          background: idx % 2 === 0 ? palette.white : palette.light,
                          transition: "background 0.2s",
                        }}
                      >
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {request.employeeName || request.employee?.name || request.employee?.fullName || `Employee #${request.employeeId}`}
                        </td>
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {new Date(request.startDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {new Date(request.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {calculateLeaveDays(request.startDate, request.endDate)} days
                        </td>
                        <td style={{ padding: 14, fontWeight: 600, maxWidth: 200 }}>
                          <div style={{ 
                            overflow: "hidden", 
                            textOverflow: "ellipsis", 
                            whiteSpace: "nowrap",
                            title: request.reason 
                          }}>
                            {request.reason || "No reason provided"}
                          </div>
                        </td>
                        <td style={{ padding: 14 }}>
                          {getStatusBadge(request.status)}
                        </td>
                        <td style={{ padding: 14 }}>
                          {request.status?.toUpperCase() === "PENDING" ? (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleLeaveAction(request.id, "approve")}
                                disabled={processingIds.has(request.id)}
                                style={{
                                  background: palette.green,
                                  color: palette.white,
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  fontWeight: 700,
                                  cursor: processingIds.has(request.id) ? "not-allowed" : "pointer",
                                  fontSize: "0.9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  transition: "background 0.2s",
                                  opacity: processingIds.has(request.id) ? 0.6 : 1,
                                }}
                              >
                                {processingIds.has(request.id) ? (
                                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleLeaveAction(request.id, "reject")}
                                disabled={processingIds.has(request.id)}
                                style={{
                                  background: palette.red,
                                  color: palette.white,
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  fontWeight: 700,
                                  cursor: processingIds.has(request.id) ? "not-allowed" : "pointer",
                                  fontSize: "0.9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  transition: "background 0.2s",
                                  opacity: processingIds.has(request.id) ? 0.6 : 1,
                                }}
                              >
                                {processingIds.has(request.id) ? (
                                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                  <FaTimesCircle />
                                )}
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: palette.gray, fontWeight: 600, fontSize: "0.9rem" }}>
                              {request.status?.toUpperCase() || "PROCESSED"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastContainer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
