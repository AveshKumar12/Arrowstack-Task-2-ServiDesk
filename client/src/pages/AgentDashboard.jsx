
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Clock,
  CheckCircle,
  LogOut,
  Search,
  RefreshCw,
  UserRound,
  AlertCircle,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AgentDashboard.css";

function AgentDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/requests/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load service requests."
      );
    } finally {
      setLoading(false);
    }
  };

const assignTicket = async (requestId) => {
  try {
    await API.patch(
      `/requests/${requestId}/assign`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Ticket assigned successfully!");
    fetchRequests();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Unable to assign ticket."
    );
  }
};

const updateTicketStatus = async (requestId, newStatus) => {
  try {
    await API.patch(
      `/requests/${requestId}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Ticket status updated successfully!");
    fetchRequests();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Unable to update ticket status."
    );
  }
};


  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchRequests();
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const filteredRequests = requests.filter((request) =>
    `${request.ticket_number} ${request.title} ${request.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openCount = requests.filter(
    (r) => r.status === "open"
  ).length;

  const progressCount = requests.filter(
    (r) => r.status === "in_progress"
  ).length;

  const resolvedCount = requests.filter(
    (r) => ["resolved", "closed"].includes(r.status)
  ).length;

  return (
    <div className="agent-layout">
      <aside className="agent-sidebar">
        <div className="agent-brand">
          <div className="agent-brand-icon">
            <Ticket size={23} />
          </div>
          <span>ServiDesk</span>
        </div>

        <div className="agent-menu-label">WORKSPACE</div>

        <div className="agent-menu active">
          <LayoutDashboard size={19} />
          Dashboard
        </div>

        <div className="agent-menu">
          <Ticket size={19} />
          All Requests
        </div>

        <div className="agent-sidebar-bottom">
          <div className="agent-profile">
            <div className="agent-avatar">
              <UserRound size={19} />
            </div>
            <div>
              <strong>Support Agent</strong>
              <small>Agent Account</small>
            </div>
          </div>

          <button className="agent-logout" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="agent-main">
        <header className="agent-topbar">
          <div>
            <h2>Agent Dashboard</h2>
            <p>Manage and resolve employee service requests.</p>
          </div>

          <button className="agent-refresh" onClick={fetchRequests}>
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="agent-welcome">
          <div>
            <span className="agent-welcome-tag">AGENT WORKSPACE</span>
            <h1>Welcome back, Agent!</h1>
            <p>Here is an overview of employee service requests.</p>
          </div>
          <div className="agent-welcome-icon">
            <Ticket size={42} />
          </div>
        </section>

        <section className="agent-stats">
          <div className="agent-stat-card">
            <div className="agent-stat-icon blue">
              <Ticket size={21} />
            </div>
            <span>Total Requests</span>
            <h2>{requests.length}</h2>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-icon orange">
              <AlertCircle size={21} />
            </div>
            <span>Open Requests</span>
            <h2>{openCount}</h2>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-icon purple">
              <Clock size={21} />
            </div>
            <span>In Progress</span>
            <h2>{progressCount}</h2>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-icon green">
              <CheckCircle size={21} />
            </div>
            <span>Resolved</span>
            <h2>{resolvedCount}</h2>
          </div>
        </section>

        <section className="agent-requests">
          <div className="agent-request-heading">
            <div>
              <h2>Employee Service Requests</h2>
              <p>View all submitted employee tickets.</p>
            </div>

            <div className="agent-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="agent-error">{error}</div>}

          {loading ? (
            <div className="agent-empty">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="agent-empty">No service requests found.</div>
          ) : (
            <div className="agent-table-wrapper">
  
<table className="agent-table">
  <thead>
    <tr>
      <th>Ticket ID</th>
      <th>Title</th>
      <th>Category</th>
      <th>Priority</th>
      <th>Status</th>
      <th>Assigned To</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    {filteredRequests.map((request) => (
      <tr key={request.id}>
        <td className="agent-ticket-id">
          {request.ticket_number}
        </td>

        <td>{request.title}</td>

        <td>{request.category}</td>

        <td>
          <span className={`agent-priority ${request.priority}`}>
            {request.priority}
          </span>
        </td>

        <td>
          <select
            className="agent-status-select"
            value={request.status}
            onChange={(e) =>
              updateTicketStatus(request.id, e.target.value)
            }
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </td>

        <td>
          {request.assigned_to ? "Assigned" : "Unassigned"}
        </td>

       <td>
  <div className="agent-action-buttons">
    {request.assigned_to ? (
      <span className="agent-assigned-label">Assigned</span>
    ) : (
      <button
        className="agent-assign-btn"
        onClick={() => assignTicket(request.id)}
      >
        Assign to Me
      </button>
    )}

    <button
      className="agent-view-btn"
      onClick={() => navigate(`/agent/tickets/${request.id}`)}
    >
      <Eye size={15} />
      View Details
    </button>
  </div>
</td>
      </tr>
    ))}
  </tbody>
</table>

            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AgentDashboard;
