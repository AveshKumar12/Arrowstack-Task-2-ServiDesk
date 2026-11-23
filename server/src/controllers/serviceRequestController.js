
const ActivityLog = require("../models/ActivityLog");
const RequestComment = require("../models/RequestComment");
const ServiceRequest = require("../models/ServiceRequest");

// Create a new service request
const createRequest = async (req, res) => {
  try {
    const { title, description, category, priority, department_id } =
      req.body;

    const request = await ServiceRequest.createServiceRequest({
      title,
      description,
      category,
      priority,
      requester_id: req.user.id,
      department_id,
    });

    await ActivityLog.createActivityLog({
  request_id: request.id,
  user_id: req.user.id,
  action: "request_created",
  details: {
    ticket_number: request.ticket_number,
    status: request.status,
  },
});
    return res.status(201).json({
      success: true,
      message: "Service request created successfully",
      request,
    });
  } catch (error) {
    console.error("Create request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create service request",
    });
  }
};

// Get logged-in employee's requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.getRequestsByUser(req.user.id);

    return res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch service requests",
    });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const query = `
      SELECT
        sr.*,
        d.name AS department_name,
        u.name AS requester_name,
        a.name AS assigned_agent_name
      FROM service_requests sr
      LEFT JOIN departments d ON sr.department_id = d.id
      LEFT JOIN users u ON sr.requester_id = u.id
      LEFT JOIN users a ON sr.assigned_to = a.id
      ORDER BY sr.created_at DESC
    `;

    const result = await require("../config/db").pool.query(query);

    return res.json({
      success: true,
      count: result.rows.length,
      requests: result.rows,
    });
  } catch (error) {
    console.error("Get all requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch all requests",
    });
  }
};

const assignRequestToMe = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE service_requests
      SET assigned_to = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await require("../config/db").pool.query(
      query,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    const request = result.rows[0];

    // Save activity log
    await ActivityLog.createActivityLog({
      request_id: request.id,
      user_id: req.user.id,
      action: "request_assigned",
      details: {
        assigned_to: req.user.id,
      },
    });

    return res.json({
      success: true,
      message: "Ticket assigned successfully",
      request,
    });
  } catch (error) {
    console.error("Assignment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to assign ticket",
    });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "open",
      "in_progress",
      "pending",
      "resolved",
      "closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status",
      });
    }

    const query = `
      UPDATE service_requests
      SET
        status = $1::varchar,
        updated_at = NOW(),
        resolved_at = CASE
          WHEN $1::varchar = 'resolved' THEN NOW()
          ELSE NULL
        END
      WHERE id = $2
      RETURNING *
    `;

    const result = await require("../config/db").pool.query(
      query,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    const request = result.rows[0];

    // Save activity log
    await ActivityLog.createActivityLog({
      request_id: request.id,
      user_id: req.user.id,
      action: "status_updated",
      details: {
        status: request.status,
      },
    });

    return res.json({
      success: true,
      message: "Ticket status updated successfully",
      request,
    });
  } catch (error) {
    console.error("Status update error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update ticket status",
    });
  }
};

const getRequestActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const { getActivityLogs } = ActivityLog;

    const result = await require("../config/db").pool.query(
      "SELECT requester_id FROM service_requests WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    const isOwner = result.rows[0].requester_id === req.user.id;
    const isStaff = ["agent", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this activity",
      });
    }

    const activities = await getActivityLogs(id);

    return res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Activity logs error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch activity logs",
    });
  }
};


const addRequestComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, is_internal = false } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    if (typeof is_internal !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid internal comment value",
      });
    }

    const requestResult = await require("../config/db").pool.query(
      "SELECT id, requester_id, assigned_to FROM service_requests WHERE id = $1",
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    const request = requestResult.rows[0];

    const isOwner = request.requester_id === req.user.id;
    const isStaff = ["agent", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to comment",
      });
    }

    // Only agents and admins can create internal comments
    if (is_internal && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Only agents and admins can create internal comments",
      });
    }

    const newComment = await RequestComment.createComment({
      request_id: id,
      user_id: req.user.id,
      comment: comment.trim(),
      is_internal,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Add comment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add comment",
    });
  }
};
const getRequestComments = async (req, res) => {
  try {
    const { id } = req.params;

    const requestResult = await require("../config/db").pool.query(
      "SELECT id, requester_id, assigned_to FROM service_requests WHERE id = $1",
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    const request = requestResult.rows[0];

    const isOwner = request.requester_id === req.user.id;
    const isStaff = ["agent", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view comments",
      });
    }

    let query = `
      SELECT
        rc.*,
        u.name AS user_name,
        u.role AS user_role
      FROM request_comments rc
      LEFT JOIN users u ON rc.user_id = u.id
      WHERE rc.request_id = $1
    `;

    // Employees cannot see internal comments
    if (!isStaff) {
      query += " AND rc.is_internal = false";
    }

    query += " ORDER BY rc.created_at ASC";

    const result = await require("../config/db").pool.query(
      query,
      [id]
    );

    return res.json({
      success: true,
      comments: result.rows,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch comments",
    });
  }
};



const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await require("../config/db").pool.query(
      `SELECT
        sr.*,
        requester.name AS requester_name,
        requester.email AS requester_email,
        agent.name AS agent_name,
        d.name AS department_name
      FROM service_requests sr
      LEFT JOIN users requester ON sr.requester_id = requester.id
      LEFT JOIN users agent ON sr.assigned_to = agent.id
      LEFT JOIN departments d ON sr.department_id = d.id
      WHERE sr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    const request = result.rows[0];

    if (
      req.user.role === "employee" &&
      Number(request.requester_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get request details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch request details",
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  assignRequestToMe,
  updateRequestStatus,
  getRequestActivity,
  addRequestComment,
  getRequestComments,
  getRequestById
};