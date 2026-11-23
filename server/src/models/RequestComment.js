
const { pool } = require("../config/db");

const createComment = async ({
  request_id,
  user_id,
  comment,
  is_internal = false,
}) => {
  const query = `
    INSERT INTO request_comments (
      request_id,
      user_id,
      comment,
      is_internal
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    request_id,
    user_id,
    comment,
    is_internal,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getCommentsByRequest = async (requestId) => {
  const query = `
    SELECT
      rc.*,
      u.name AS user_name,
      u.role AS user_role
    FROM request_comments rc
    LEFT JOIN users u ON rc.user_id = u.id
    WHERE rc.request_id = $1
    ORDER BY rc.created_at ASC
  `;

  const result = await pool.query(query, [requestId]);

  return result.rows;
};

module.exports = {
  createComment,
  getCommentsByRequest,
};
