
const { pool } = require("../config/db");

const createUser = async ({
  name,
  email,
  password,
  department_id,
}) => {
  const query = `
    INSERT INTO users (name, email, password, department_id)
    VALUES ($1, LOWER($2), $3, $4)
    RETURNING id, name, email, role, department_id, created_at
  `;

  const values = [
    name,
    email,
    password,
    department_id || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, department_id, is_active, created_at
     FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
