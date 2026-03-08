const express = require("express");
const multer = require("multer");
const path = require("path");
const { requireAuth } = require("../middleware/auth");
const Document = require("../models/document.model");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const docs = await Document.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json({ status: "success", data: docs });
  } catch (err) { next(err); }
});

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    const doc = await Document.create({
      userId: req.user.uid,
      name: req.body.name || file?.originalname || "Untitled",
      type: file ? path.extname(file.originalname).slice(1).toUpperCase() : "TXT",
      size: file ? `${(file.size / 1024).toFixed(1)} KB` : "0 KB",
      filePath: file?.path || null,
      shared: false,
    });
    res.status(201).json({ status: "success", data: doc });
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ status: "error", message: "Not found" });
    res.json({ status: "success", data: doc });
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!doc) return res.status(404).json({ status: "error", message: "Not found" });
    res.json({ status: "success", message: "Deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
