const express = require("express");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const {
  createDebugSession,
  getDebugSession,
  getHistory,
  deleteSession,
} = require("../controllers/debug.controller");

const router = express.Router();

const debugLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: "error", message: "Too many requests. Please try again later." },
});

router.post("/", debugLimiter, optionalAuth, createDebugSession);
router.get("/history", requireAuth, getHistory);
router.get("/:id", optionalAuth, getDebugSession);
router.delete("/:id", requireAuth, deleteSession);

module.exports = router;
