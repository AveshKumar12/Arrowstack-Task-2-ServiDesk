
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CreateRequest from "./pages/CreateRequest";
import AgentDashboard from "./pages/AgentDashboard";
import TicketDetails from "./pages/TicketDetails";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageTickets from "./pages/ManageTickets";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route
        path="/employee/create-request"
        element={<CreateRequest />}
      />

      <Route path="/agent" element={<AgentDashboard />} />
      <Route path="/agent/tickets/:id" element={<TicketDetails />} />

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/tickets" element={<ManageTickets />} />
    </Routes>
  );
}

export default App;
