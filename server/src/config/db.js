
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("PostgreSQL client connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error.message);
});

const connectDB = async () => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time, current_database() AS database"
    );

    console.log("PostgreSQL connected successfully!");
    console.log("Database:", result.rows[0].database);
    console.log("Server time:", result.rows[0].current_time);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    throw error;
  }
};

module.exports = { pool, connectDB };
