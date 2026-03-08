const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  syncUser,
  getMe,
  updateMe,
  updateSettings,
  deleteMe,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/sync", requireAuth, syncUser);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.put("/me/settings", requireAuth, updateSettings);
router.delete("/me", requireAuth, deleteMe);

module.exports = router;
