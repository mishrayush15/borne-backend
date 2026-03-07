const express = require("express");
const { createDebugSession, getDebugSession } = require("../controllers/debug.controller");
const { debugLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/", debugLimiter, createDebugSession);
router.get("/:id", getDebugSession);

module.exports = router;
