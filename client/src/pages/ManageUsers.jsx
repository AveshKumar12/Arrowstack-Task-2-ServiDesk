
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCog,
  User,
  Mail,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import API from "../api/axios";
import "./ManageUsers.css";

function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
const [newUser, setNewUser] = useState({
  name: "",
  email: "",
  password: "",
  role: "agent",
  department_id: "",
});
const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await API.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };
const handleUpdateUser = async (userId, updates) => {
  try {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    await API.patch(`/admin/users/${userId}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("User updated successfully!");
    await fetchUsers();
  } catch (err) {
    alert(
      err.response?.data?.message || "Unable to update user."
    );
  }
};
const handleCreateUser = async (e) => {
  e.preventDefault();

  try {
    setCreating(true);

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const payload = {
      ...newUser,
      department_id: newUser.department_id
        ? Number(newUser.department_id)
        : null,
    };

    const response = await API.post("/admin/users", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert(response.data.message || "User created successfully!");

    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "agent",
      department_id: "",
    });

    setShowAddForm(false);
    await fetchUsers();
  } catch (err) {
    alert(
      err.response?.data?.message || "Unable to create user."
    );
  } finally {
    setCreating(false);
  }
};
  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    if (role === "admin") return ShieldCheck;
    if (role === "agent") return UserCog;
    return User;
  };

  const counts = {
    all: users.length,
    employee: users.filter((u) => u.role === "employee").length,
    agent: users.filter((u) => u.role === "agent").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="manage-users-page">
      <header className="manage-users-header">
        <button
          className="manage-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="manage-heading">
          <div className="manage-heading-icon">
            <Users size={25} />
          </div>
          <div>
            <h1>Manage Users</h1>
            <p>View and monitor all registered platform users.</p>
          </div>
        </div>

        <button
          className="manage-refresh-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <main className="manage-users-content">
        <section className="manage-user-summary">
          <div>
            <span>Total Users</span>
            <h2>{counts.all}</h2>
          </div>
          <div>
            <span>Employees</span>
            <h2>{counts.employee}</h2>
          </div>
          <div>
            <span>Agents</span>
            <h2>{counts.agent}</h2>
          </div>
          <div>
            <span>Admins</span>
            <h2>{counts.admin}</h2>
          </div>
        </section>

        <section className="manage-users-table-section">
       <div className="manage-table-heading">
  <div>
    <h2>All Platform Users</h2>
    <p>Manage and monitor user accounts</p>
  </div>

  <div className="manage-table-actions">
    <span className="manage-total-badge">
      {filteredUsers.length} Users
    </span>

    <button
      className="add-user-btn"
      onClick={() => setShowAddForm(!showAddForm)}
    >
      + Add New User
    </button>
  </div>
</div>

          <div className="manage-filters">
            <div className="manage-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

{showAddForm && (
  <form className="add-user-form" onSubmit={handleCreateUser}>
    <h3>Create New Account</h3>

    <div className="add-user-grid">
      <input
        type="text"
        placeholder="Full Name"
        value={newUser.name}
        onChange={(e) =>
          setNewUser({ ...newUser, name: e.target.value })
        }
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        value={newUser.email}
        onChange={(e) =>
          setNewUser({ ...newUser, email: e.target.value })
        }
        required
      />

      <input
        type="password"
        placeholder="Password (minimum 8 characters)"
        value={newUser.password}
        onChange={(e) =>
          setNewUser({ ...newUser, password: e.target.value })
        }
        minLength={8}
        required
      />

      <select
        value={newUser.role}
        onChange={(e) =>
          setNewUser({ ...newUser, role: e.target.value })
        }
      >
        <option value="agent">Agent</option>
        <option value="employee">Employee</option>
      </select>

      <select
        value={newUser.department_id}
        onChange={(e) =>
          setNewUser({ ...newUser, department_id: e.target.value })
        }
      >
        <option value="">Select Department (Optional)</option>
        <option value="1">IT</option>
        <option value="2">HR</option>
        <option value="3">Facilities</option>
      </select>
    </div>

    <div className="add-user-buttons">
      <button type="submit" disabled={creating}>
        {creating ? "Creating..." : "Create Account"}
      </button>

      <button
        type="button"
        onClick={() => setShowAddForm(false)}
      >
        Cancel
      </button>
    </div>
  </form>
)}

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="employee">Employees</option>
              <option value="agent">Agents</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {loading ? (
            <div className="manage-loading">
              <RefreshCw className="manage-spinner" size={26} />
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="manage-error">
              <AlertCircle size={20} />
              {error}
              <button onClick={fetchUsers}>Try Again</button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="manage-empty">
              <Users size={32} />
              <h3>No users found</h3>
              <p>Try changing your search or role filter.</p>
            </div>
          ) : (
            <div className="manage-table-wrapper">
              <table className="manage-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department ID</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="manage-user-info">
                            <div className="manage-user-avatar">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{user.name}</strong>
                              <span>
                                <Mail size={12} />
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`manage-role ${user.role}`}>
                            <RoleIcon size={14} />
                            {user.role}
                          </span>
                        </td>

                        <td>
                          {user.department_id ?? "Not assigned"}
                        </td>

                        <td>
                          <span
                            className={`manage-user-status ${
                              user.is_active ? "active" : "inactive"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <span className="manage-joined-date">
                            <CalendarDays size={13} />
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
  <div className="manage-user-actions">
    <select
      value={user.role}
      onChange={(e) =>
        handleUpdateUser(user.id, { role: e.target.value })
      }
    >
      <option value="employee">Employee</option>
      <option value="agent">Agent</option>
      <option value="admin">Admin</option>
    </select>

    <button
      className={user.is_active ? "deactivate-btn" : "activate-btn"}
      onClick={() =>
        handleUpdateUser(user.id, {
          is_active: !user.is_active,
        })
      }
    >
      {user.is_active ? "Deactivate" : "Activate"}
    </button>
  </div>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManageUsers;
