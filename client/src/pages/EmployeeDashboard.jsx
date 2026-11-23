
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  LayoutDashboard, Ticket, Clock, CheckCircle2,
  Plus, LogOut, Headset, Search, Bell,
  ArrowUpRight, LifeBuoy, Settings, Menu
} from "lucide-react";
import API from "../api/axios";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") || "{}"
  );

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    API.get("/requests/my-requests", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => setRequests(data.requests || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const filteredRequests = requests.filter((request) =>
    `${request.ticket_number} ${request.title} ${request.status}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: Ticket,
      color: "blue",
      note: "All submitted tickets"
    },
    {
      label: "Open Requests",
      value: requests.filter(r => r.status === "open").length,
      icon: Clock,
      color: "orange",
      note: "Waiting for support"
    },
    {
      label: "In Progress",
      value: requests.filter(r => r.status === "in_progress").length,
      icon: ArrowUpRight,
      color: "purple",
      note: "Currently being handled"
    },
    {
      label: "Resolved",
      value: requests.filter(r => r.status === "resolved" || r.status === "closed").length,
      icon: CheckCircle2,
      color: "green",
      note: "Successfully completed"
    }
  ];

  return (
    <div className="sd-layout">
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <div className="sd-brand-icon"><Headset size={23}/></div>
          <span>Servi<span>Desk</span></span>
        </div>

        <div className="sd-menu-label">WORKSPACE</div>
        <nav className="sd-nav">
          <button className="sd-nav-item active">
            <LayoutDashboard size={19}/> Dashboard
          </button>
          <button className="sd-nav-item" onClick={() => document.getElementById("requests")?.scrollIntoView({ behavior: "smooth" })}>
            <Ticket size={19}/> My Requests
          </button>
          <button className="sd-nav-item" onClick={() => navigate("/employee/create-request")}>
            <Plus size={19}/> Create Request
          </button>
        </nav>

        <div className="sd-menu-label">SUPPORT</div>
        <nav className="sd-nav">
          <button className="sd-nav-item">
            <LifeBuoy size={19}/> Help Center
          </button>
          <button className="sd-nav-item">
            <Settings size={19}/> Settings
          </button>
        </nav>

        <div className="sd-sidebar-bottom">
          <div className="sd-profile">
            <div className="sd-avatar">
              {(user.name || "E").charAt(0).toUpperCase()}
            </div>
            <div className="sd-profile-info">
              <strong>{user.name || "Employee"}</strong>
              <span>Employee Account</span>
            </div>
          </div>
          <button className="sd-logout" onClick={logout}>
            <LogOut size={17}/> Sign out
          </button>
        </div>
      </aside>

      <main className="sd-main">
        <header className="sd-topbar">
          <div className="sd-mobile-brand">
            <Headset size={22}/> ServiDesk
          </div>
          <div className="sd-breadcrumb">Workspace <span>/</span> Dashboard</div>
          <div className="sd-top-actions">
            <button className="sd-icon-btn" aria-label="Notifications">
              <Bell size={19}/>
              <i/>
            </button>
            <div className="sd-top-avatar">
              {(user.name || "E").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="sd-content">
          <section className="sd-welcome">
            <div>
              <div className="sd-eyebrow">EMPLOYEE WORKSPACE</div>
              <h1>Good to see you, {user.name?.split(" ")[0] || "there"}!</h1>
              <p>Track your requests and get the support you need.</p>
            </div>
            <button className="sd-primary-btn" onClick={() => navigate("/employee/create-request")}>
              <Plus size={18}/> New Request
            </button>
          </section>

          <section className="sd-stats">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article className="sd-stat-card" key={stat.label}>
                  <div className={`sd-stat-icon ${stat.color}`}>
                    <Icon size={21}/>
                  </div>
                  <div className="sd-stat-value">{stat.value}</div>
                  <div className="sd-stat-label">{stat.label}</div>
                  <div className="sd-stat-note">{stat.note}</div>
                </article>
              );
            })}
          </section>

          <section className="sd-request-panel" id="requests">
            <div className="sd-panel-heading">
              <div>
                <h2>My Service Requests</h2>
                <p>View and track all your submitted tickets.</p>
              </div>
              <div className="sd-search">
                <Search size={17}/>
                <input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="sd-empty">Loading your requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="sd-empty">
                <div className="sd-empty-icon"><Ticket size={27}/></div>
                <h3>{search ? "No matching requests" : "No requests yet"}</h3>
                <p>{search ? "Try another search term." : "Create your first service request and our team will assist you."}</p>
                {!search && (
                  <button className="sd-primary-btn" onClick={() => navigate("/employee/create-request")}>
                    <Plus size={17}/> Create Request
                  </button>
                )}
              </div>
            ) : (
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Request Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="sd-ticket-id">{request.ticket_number}</td>
                        <td className="sd-ticket-title">{request.title}</td>
                        <td>{request.category}</td>
                        <td>
                          <span className={`sd-priority ${request.priority}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`sd-status ${request.status}`}>
                            {request.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td>
  <button
    className="sd-view-details-btn"
    onClick={() => navigate(`/agent/tickets/${request.id}`)}
  >
    <Eye size={15} />
    View Details
  </button>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="sd-footer">
            <span>© 2026 ServiDesk. All rights reserved.</span>
            <span>Employee Support Portal</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
