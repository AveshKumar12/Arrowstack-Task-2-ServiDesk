
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Users, Ticket } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import API from "../api/axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await API.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const statCards = stats
    ? [
        {
          title: "Total Employees",
          value: stats.total_employees,
          icon: Users,
          color: "blue",
        },
        {
          title: "Total Agents",
          value: stats.total_agents,
          icon: UserCog,
          color: "purple",
        },
        {
          title: "Total Admins",
          value: stats.total_admins,
          icon: ShieldCheck,
          color: "orange",
        },
        {
          title: "Total Tickets",
          value: stats.total_tickets,
          icon: Ticket,
          color: "cyan",
        },
      ]
    : [];

  const ticketStatuses = stats
    ? [
        {
          title: "Open",
          value: stats.open_tickets,
          icon: AlertCircle,
          color: "blue",
        },
        {
          title: "In Progress",
          value: stats.in_progress_tickets,
          icon: Clock,
          color: "purple",
        },
        {
          title: "Pending",
          value: stats.pending_tickets,
          icon: AlertCircle,
          color: "orange",
        },
        {
          title: "Resolved",
          value: stats.resolved_tickets,
          icon: CheckCircle,
          color: "green",
        },
        {
          title: "Closed",
          value: stats.closed_tickets,
          icon: CheckCircle,
          color: "gray",
        },
      ]
    : [];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h2>ServiDesk</h2>
            <span>Administration</span>
          </div>
        </div>

        <div className="admin-nav-label">MAIN MENU</div>

        <nav className="admin-nav">
          <button className="admin-nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </button>
        </nav>

<button
  className="admin-nav-item"
  onClick={() => navigate("/admin/users")}
>
  <Users size={19} />
  Manage Users
</button>
<button
  className="admin-nav-item"
  onClick={() => navigate("/admin/tickets")}
>
  <Ticket size={19} />
  Manage Tickets
</button>
        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-breadcrumb">
              ServiDesk / Dashboard
            </p>
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">
              Monitor your service desk performance and activity.
            </p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="admin-loading">
            <RefreshCw className="admin-spinner" size={28} />
            <p>Loading dashboard statistics...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={fetchStats}>Try Again</button>
          </div>
        ) : (
          <>
            <section className="admin-welcome">
              <div>
                <span>OVERVIEW</span>
                <h2>Welcome to ServiDesk Admin</h2>
                <p>
                  Here's what's happening across your service desk today.
                </p>
              </div>
              <div className="admin-welcome-icon">
                <ShieldCheck size={48} />
              </div>
            </section>

            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2>Platform Overview</h2>
                  <p>Users and service request summary</p>
                </div>
              </div>

              <div className="admin-stats-grid">
                {statCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      className="admin-stat-card"
                      key={card.title}
                    >
                      <div className="admin-stat-top">
                        <div className={`admin-stat-icon ${card.color}`}>
                          <Icon size={21} />
                        </div>
                        <span className="admin-stat-label">
                          {card.title}
                        </span>
                      </div>
                      <h3>{card.value}</h3>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2>Ticket Status</h2>
                  <p>Current breakdown of all service requests</p>
                </div>
              </div>

              <div className="admin-status-grid">
                {ticketStatuses.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="admin-status-card"
                      key={item.title}
                    >
                      <div className={`admin-status-icon ${item.color}`}>
                        <Icon size={19} />
                      </div>
                      <div>
                        <h3>{item.value}</h3>
                        <p>{item.title} Tickets</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
