const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB, pool } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", serviceRequestRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ServiDesk API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS time"
    );

    res.json({
      success: true,
      message: "API and PostgreSQL are working",
      database: result.rows[0].database,
      time: result.rows[0].time,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database health check failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`ServiDesk server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed.");
    process.exit(1);
  }
};

startServer();
