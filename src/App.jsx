import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./authContext.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/Managerdashboard";
import EmployeeList from "./pages/Employee/EmployeeList";
import AddEmployee from "./pages/Employee/AddEmployee";
import LeaveRequests from "./pages/Leave/LeaveRequests";
import LeaveApproval from "./pages/Leave/LeaveApproval";
import PayrollProcessing from "./pages/Payroll/PayrollProcessing";
import PayslipGeneration from "./pages/Payroll/PayslipGeneration";

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      {/* Dashboard routes only accessible if logged in */}
      {user && user.role === "admin" && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}
      {user && user.role === "HR" && (
        <Route path="/hr" element={<HRDashboard />} />
      )}
      {user && user.role === "MANAGER" && (
        <Route path="/manager" element={<ManagerDashboard />} />
      )}
      <Route path="/Employee/AddEmployee/add" element={<AddEmployee />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
