const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Project = require("../models/project.model");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json({ status: "success", data: projects });
  } catch (err) { next(err); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, description, status, members, icon } = req.body;
    const project = await Project.create({
      userId: req.user.uid,
      name: name || "New Project",
      description: description || "",
      status: status || "Planning",
      members: members || 1,
      icon: icon || name?.slice(0, 2).toUpperCase() || "NP",
    });
    res.status(201).json({ status: "success", data: project });
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      { $set: req.body },
      { new: true }
    );
    if (!project) return res.status(404).json({ status: "error", message: "Not found" });
    res.json({ status: "success", data: project });
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!project) return res.status(404).json({ status: "error", message: "Not found" });
    res.json({ status: "success", message: "Deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
