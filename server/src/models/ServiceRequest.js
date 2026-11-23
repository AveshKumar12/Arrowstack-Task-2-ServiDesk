
const { pool } = require("../config/db");
const crypto = require("crypto");

const createServiceRequest = async ({
  title,
  description,
  category,
  priority,
  requester_id,
  department_id,
}) => {
  const ticketNumber = `SD-${Date.now()}-${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;

  const query = `
    INSERT INTO service_requests (
      ticket_number,
      title,
      description,
      category,
      priority,
      requester_id,
      department_id,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
    RETURNING *
  `;

  const values = [
    ticketNumber,
    title,
    description,
    category,
    priority || "medium",
    requester_id,
    department_id || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getRequestsByUser = async (userId) => {
  const query = `
    SELECT
      sr.*,
      d.name AS department_name
    FROM service_requests sr
    LEFT JOIN departments d
      ON sr.department_id = d.id
    WHERE sr.requester_id = $1
    ORDER BY sr.created_at DESC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};

module.exports = {
  createServiceRequest,
  getRequestsByUser,
};
