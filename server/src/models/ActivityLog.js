
const { pool } = require("../config/db");

const createActivityLog = async ({
  request_id,
  user_id,
  action,
  details,
}) => {
  const query = `
    INSERT INTO activity_logs (
      request_id,
      user_id,
      action,
      details
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    request_id,
    user_id,
    action,
    JSON.stringify(details || {}),
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getActivityLogs = async (requestId) => {
  const query = `
    SELECT
      al.*,
      u.name AS user_name,
      u.role AS user_role
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.request_id = $1
    ORDER BY al.created_at DESC
  `;

  const result = await pool.query(query, [requestId]);

  return result.rows;
};

module.exports = {
  createActivityLog,
  getActivityLogs,
};
