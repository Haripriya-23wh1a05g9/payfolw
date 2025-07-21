import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function AddEmployee() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    totalExperience: "",
    pastExperience: "",
    password: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          age: Number(form.age),
          totalExperience: Number(form.totalExperience),
          pastExperience: form.pastExperience,
          passwordHash: form.password // backend should hash this!
        })
      });
      if (!res.ok) throw new Error("Failed to add employee");
      setSuccess(true);
      setForm({
        fullName: "",
        email: "",
        age: "",
        totalExperience: "",
        pastExperience: "",
        password: ""
      });
    } catch (err) {
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
        <h2 className="text-2xl font-semibold mb-4">Add New Employee</h2>
        <form onSubmit={handleSubmit} aria-label="Add employee form" style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
          <label htmlFor="fullName" style={{ fontWeight: 500, marginBottom: 4 }}>Full Name</label>
          <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name" style={{ width: "100%", marginBottom: 4, padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Full Name" />

          <label htmlFor="email" style={{ fontWeight: 500, marginBottom: 4 }}>Email</label>
          <input id="email" name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" style={{ width: "100%", marginBottom: 4, padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Email" />

          <label htmlFor="age" style={{ fontWeight: 500, marginBottom: 4 }}>Age</label>
          <input id="age" name="age" value={form.age} onChange={handleChange} required type="number" placeholder="Age" style={{ width: "100%", marginBottom: 4, padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Age" />

          <label htmlFor="totalExperience" style={{ fontWeight: 500, marginBottom: 4 }}>Total Experience (years)</label>
          <input id="totalExperience" name="totalExperience" value={form.totalExperience} onChange={handleChange} required type="number" placeholder="Total Experience (years)" style={{ width: "100%", marginBottom: 4, padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Total Experience" />

          <label htmlFor="pastExperience" style={{ fontWeight: 500, marginBottom: 4 }}>Past Experience (optional)</label>
          <textarea id="pastExperience" name="pastExperience" value={form.pastExperience} onChange={handleChange} placeholder="Past Experience (optional)" style={{ width: "100%", marginBottom: 4, padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-label="Past Experience" />

          <label htmlFor="password" style={{ fontWeight: 500, marginBottom: 4 }}>Password</label>
          <input id="password" name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Password" style={{ width: "100%", marginBottom: 4, padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Password" />

          <button type="submit" style={{ background: loading ? "#b2f5ea" : "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", width: "100%", fontWeight: 600, fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 12px rgba(79,209,197,0.13)", transition: "background 0.2s" }} disabled={loading} aria-busy={loading} aria-label="Add Employee">
            {loading ? (
              <span className="spinner" style={{ width: 22, height: 22, border: "3px solid #b2f5ea", borderTop: "3px solid #4fd1c5", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8, display: "inline-block" }}></span>
            ) : null}
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </form>
        {error && <div role="alert" style={{ marginTop: 20, color: "#ef4444", fontWeight: 600 }}>{error}</div>}
        {success && <div style={{ marginTop: 20, color: "#22c55e", fontWeight: 600 }}>Employee added!</div>}
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
          form {
            max-width: 98vw !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}