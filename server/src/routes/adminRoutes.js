
const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  getAllTickets,
  assignTicketToAgent,
  getAllAgents,
  updateUser,
  createUser
} = require("../controllers/adminController");

const router = express.Router();

// Admin Dashboard Statistics
router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);

// Get All Users - Admin Only
router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);


// Get All Tickets - Admin Only
router.get(
  "/tickets",
  protect,
  authorize("admin"),
  getAllTickets
);




// Get All Active Agents - Admin Only
router.get(
  "/agents",
  protect,
  authorize("admin"),
  getAllAgents
);

// Assign Ticket to Selected Agent - Admin Only
router.patch(
  "/tickets/:id/assign",
  protect,
  authorize("admin"),
  assignTicketToAgent
);

// Update User - Admin Only
router.patch(
  "/users/:id",
  protect,
  authorize("admin"),
  updateUser
);

router.post("/users", protect, authorize("admin"), createUser);
module.exports = router;
