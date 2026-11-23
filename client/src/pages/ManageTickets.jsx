
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Ticket,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import API from "../api/axios";
import "./ManageTickets.css";

function ManageTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
const [selectedAgents, setSelectedAgents] = useState({});
const [updatingTicket, setUpdatingTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



const [selectedStatuses, setSelectedStatuses] = useState({});

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setError(
        err.response?.data?.message || "Unable to load tickets."
      );
    } finally {
      setLoading(false);
    }
  };

const fetchAgents = async () => {
  try {
    const response = await API.get("/admin/agents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAgents(response.data.agents || []);
  } catch (err) {
    console.error("Fetch agents error:", err);
  }
};
  useEffect(() => {
    fetchAgents();

    fetchTickets();
  }, []);
const handleAssignAgent = async (ticketId) => {
  const agentId = selectedAgents[ticketId];

  if (!agentId) {
    alert("Please select an agent first.");
    return;
  }

  try {
    setUpdatingTicket(ticketId);

    await API.patch(
      `/admin/tickets/${ticketId}/assign`,
      { agent_id: agentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Ticket assigned successfully!");
    await fetchTickets();
  } catch (err) {
    alert(
      err.response?.data?.message || "Unable to assign ticket."
    );
  } finally {
    setUpdatingTicket(null);
  }
};
const handleUpdateStatus = async (ticketId) => {
  const status = selectedStatuses[ticketId];

  if (!status) {
    alert("Please select a status first.");
    return;
  }

  try {
    setUpdatingTicket(ticketId);

    await API.patch(
      `/requests/${ticketId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Ticket status updated successfully!");
    await fetchTickets();
  } catch (err) {
    alert(
      err.response?.data?.message || "Unable to update ticket status."
    );
  } finally {
    setUpdatingTicket(null);
  }
};

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        ticket.ticket_number?.toLowerCase().includes(searchText) ||
        ticket.title?.toLowerCase().includes(searchText) ||
        ticket.requester_name?.toLowerCase().includes(searchText) ||
        ticket.requester_email?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const getStatusClass = (status) => {
    return `ticket-status ${status?.replace("_", "-")}`;
  };

  const getPriorityClass = (priority) => {
    return `ticket-priority ${priority}`;
  };

  return (
    <div className="manage-tickets-page">
      <div className="manage-tickets-header">
        <div>
          <button
            className="tickets-back-btn"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <h1>Manage Tickets</h1>
          <p>Monitor and manage all employee service requests.</p>
        </div>

        <button
          className="tickets-refresh-btn"
          onClick={fetchTickets}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="tickets-overview">
        <div className="ticket-overview-card">
          <div className="ticket-overview-icon">
            <Ticket size={21} />
          </div>
          <div>
            <span>Total Tickets</span>
            <h2>{tickets.length}</h2>
          </div>
        </div>

        <div className="ticket-overview-card">
          <div className="ticket-overview-icon open-icon">
            <AlertCircle size={21} />
          </div>
          <div>
            <span>Open Tickets</span>
            <h2>{tickets.filter((t) => t.status === "open").length}</h2>
          </div>
        </div>

        <div className="ticket-overview-card">
          <div className="ticket-overview-icon progress-icon">
            <RefreshCw size={21} />
          </div>
          <div>
            <span>In Progress</span>
            <h2>
              {tickets.filter((t) => t.status === "in_progress").length}
            </h2>
          </div>
        </div>

        <div className="ticket-overview-card">
          <div className="ticket-overview-icon resolved-icon">
            <Ticket size={21} />
          </div>
          <div>
            <span>Resolved</span>
            <h2>
              {tickets.filter((t) => t.status === "resolved").length}
            </h2>
          </div>
        </div>
      </div>

      <div className="tickets-table-container">
        <div className="tickets-toolbar">
          <div>
            <h2>All Service Requests</h2>
            <p>{filteredTickets.length} tickets found</p>
          </div>

          <div className="tickets-filters">
            <div className="tickets-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="tickets-message">Loading tickets...</div>
        ) : error ? (
          <div className="tickets-message error-message">{error}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="tickets-message">No tickets found.</div>
        ) : (
          <div className="tickets-table-scroll">
            <table className="manage-tickets-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Requester</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.ticket_number}</strong>
                      <span className="ticket-title">
                        {ticket.title}
                      </span>
                    </td>

                    <td>
                      <strong>{ticket.requester_name}</strong>
                      <span className="ticket-title">
                        {ticket.requester_email}
                      </span>
                    </td>

                    <td>{ticket.department_name || "N/A"}</td>

                    <td>
                      <span className={getPriorityClass(ticket.priority)}>
                        {ticket.priority}
                      </span>
                    </td>

                <td>
  <div className="ticket-agent-control">
    <select
      value={selectedStatuses[ticket.id] || ticket.status}
      onChange={(e) =>
        setSelectedStatuses((prev) => ({
          ...prev,
          [ticket.id]: e.target.value,
        }))
      }
    >
      <option value="open">Open</option>
      <option value="in_progress">In Progress</option>
      <option value="pending">Pending</option>
      <option value="resolved">Resolved</option>
      <option value="closed">Closed</option>
    </select>

    <button
      className="ticket-assign-btn"
      onClick={() => handleUpdateStatus(ticket.id)}
      disabled={
        updatingTicket === ticket.id ||
        selectedStatuses[ticket.id] === undefined ||
        selectedStatuses[ticket.id] === ticket.status
      }
    >
      {updatingTicket === ticket.id ? "Updating..." : "Update"}
    </button>
  </div>
</td>

<td>
  <div className="ticket-agent-control">
    <select
      value={selectedAgents[ticket.id] || ""}
      onChange={(e) =>
        setSelectedAgents((prev) => ({
          ...prev,
          [ticket.id]: e.target.value,
        }))
      }
    >
      <option value="">Select Agent</option>

      {agents.map((agent) => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>

    <button
      className="ticket-assign-btn"
      onClick={() => handleAssignAgent(ticket.id)}
      disabled={updatingTicket === ticket.id}
    >
      {updatingTicket === ticket.id ? "Assigning..." : "Assign"}
    </button>
  </div>

  <span className="ticket-title">
    Current: {ticket.agent_name || "Unassigned"}
  </span>
</td>
                    <td>
                      <button
                        className="ticket-view-btn"
                        onClick={() =>
                          navigate(`/agent/tickets/${ticket.id}`)
                        }
                        title="View ticket details"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTickets;
