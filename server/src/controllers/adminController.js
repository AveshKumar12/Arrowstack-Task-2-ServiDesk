
const { pool } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");
// Admin Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'employee') AS total_employees,
        (SELECT COUNT(*) FROM users WHERE role = 'agent') AS total_agents,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
        (SELECT COUNT(*) FROM service_requests) AS total_tickets,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'open') AS open_tickets,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'in_progress') AS in_progress_tickets,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'pending') AS pending_tickets,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'resolved') AS resolved_tickets,
        (SELECT COUNT(*) FROM service_requests WHERE status = 'closed') AS closed_tickets
    `);

    const stats = result.rows[0];

    // Convert PostgreSQL COUNT values into numbers
    Object.keys(stats).forEach((key) => {
      stats[key] = Number(stats[key]);
    });

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Admin dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics.",
    });
  }
};


// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        department_id,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
    });
  }
};

// Update User Status and Role - Admin Only
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;

    if (is_active === undefined && role === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update.",
      });
    }

    if (role !== undefined &&
        !["employee", "agent", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    if (Number(id) === req.user.id &&
        (is_active === false || (role && role !== "admin"))) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate or change your own admin role.",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET is_active = COALESCE($1, is_active),
           role = COALESCE($2, role),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, role, is_active, department_id`,
      [is_active ?? null, role ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
};
// Get All Tickets - Admin Only
const getAllTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sr.*,
        requester.name AS requester_name,
        requester.email AS requester_email,
        agent.name AS agent_name,
        d.name AS department_name
      FROM service_requests sr
      LEFT JOIN users requester
        ON sr.requester_id = requester.id
      LEFT JOIN users agent
        ON sr.assigned_to = agent.id
      LEFT JOIN departments d
        ON sr.department_id = d.id
      ORDER BY sr.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      tickets: result.rows,
    });
  } catch (error) {
    console.error("Get all tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tickets.",
    });
  }
};



// Assign Ticket to Selected Agent - Admin Only
const assignTicketToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;

    if (!agent_id || !Number.isInteger(Number(agent_id))) {
      return res.status(400).json({
        success: false,
        message: "Valid agent ID is required.",
      });
    }

    const agentResult = await pool.query(
      `SELECT id FROM users
       WHERE id = $1 AND role = 'agent' AND is_active = true`,
      [agent_id]
    );

    if (agentResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Active agent not found.",
      });
    }

    const result = await pool.query(
      `UPDATE service_requests
       SET assigned_to = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [agent_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const request = result.rows[0];

    await ActivityLog.createActivityLog({
      request_id: request.id,
      user_id: req.user.id,
      action: "request_assigned",
      details: { assigned_to: Number(agent_id) },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket assigned to agent successfully.",
      request,
    });
  } catch (error) {
    console.error("Admin ticket assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to assign ticket.",
    });
  }
};

// Get All Active Agents - Admin Only
const getAllAgents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email
      FROM users
      WHERE role = 'agent' AND is_active = true
      ORDER BY name ASC
    `);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      agents: result.rows,
    });
  } catch (error) {
    console.error("Get all agents error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch agents.",
    });
  }
};

// Admin creates a new user (Employee or Agent)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    if (!["employee", "agent"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only employee or agent accounts can be created",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const bcrypt = require("bcryptjs");
    const { pool } = require("../config/db");

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department_id, is_active, created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role,
        department_id || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create user",
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllTickets,
  assignTicketToAgent,
  getAllAgents,
  updateUser,
  createUser,
};
