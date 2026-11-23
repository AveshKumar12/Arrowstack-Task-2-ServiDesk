
const express = require("express");
const { z } = require("zod");
 const { protect, authorize } = require("../middleware/authMiddleware");

// const {
//   createRequest,
//   getMyRequests,
// } = require("../controllers/serviceRequestController");
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  assignRequestToMe,
  updateRequestStatus,
  getRequestActivity,
  addRequestComment,
  getRequestComments,
  getRequestById,
} = require("../controllers/serviceRequestController");

const router = express.Router();

// Employee views own requests
router.get("/my-requests", protect, getMyRequests);

router.get(
  "/all",
  protect,
  authorize("agent", "admin"),
  getAllRequests
);

router.patch(
  "/:id/assign",
  protect,
  authorize("agent", "admin"),
  assignRequestToMe
);

router.patch(
  "/:id/status",
  protect,
  authorize("agent", "admin"),
  updateRequestStatus
);

router.get(
  "/:id",
  protect,
  authorize("agent", "admin", "employee"),
  getRequestById
);



router.get("/:id/activity", protect, getRequestActivity);
// Add a comment
router.post("/:id/comments", protect, addRequestComment);

// Get request comments
router.get("/:id/comments", protect, getRequestComments);

// Request validation
const validateRequest = (req, res, next) => {
  const schema = z.object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(10),
    category: z.enum(["IT", "HR", "Facilities"]),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    department_id: z.coerce.number().int().positive().optional(),
  });

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues,
    });
  }

  req.body = result.data;
  next();
};

// Employee creates a request
router.post("/", protect, validateRequest, createRequest);

module.exports = router;
