const { getAdmin } = require("../config/firebase-admin");
const logger = require("../utils/logger");

async function requireAuth(req, res, next) {
  const admin = getAdmin();
  if (!admin) {
    return res.status(503).json({ status: "error", message: "Auth service unavailable" });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "No token provided" });
  }

  try {
    const token = header.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Auth failed: ${err.message}`);
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
}

async function optionalAuth(req, _res, next) {
  const admin = getAdmin();
  if (!admin) return next();

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  try {
    const token = header.split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
  } catch {
    // continue without user
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
