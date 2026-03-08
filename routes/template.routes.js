const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Template = require("../models/template.model");

const router = express.Router();

const SEED_TEMPLATES = [
  { name: "Bug Report Analyzer", description: "Analyze and categorize bug reports automatically", category: "Development", icon: "BR", prompt: "Analyze this bug report and provide severity, steps to reproduce, and suggested fix." },
  { name: "Code Review Helper", description: "Get AI-powered code review suggestions", category: "Development", icon: "CR", prompt: "Review this code and suggest improvements for performance, readability, and security." },
  { name: "API Documentation", description: "Generate comprehensive API documentation", category: "Documentation", icon: "AD", prompt: "Generate REST API documentation for the following endpoints." },
  { name: "Error Message Decoder", description: "Decode cryptic error messages into plain English", category: "Debugging", icon: "ED", prompt: "Explain this error message in plain English and suggest possible solutions." },
  { name: "Performance Profiler", description: "Identify performance bottlenecks in code", category: "Development", icon: "PP", prompt: "Analyze this code for performance issues and suggest optimizations." },
  { name: "Security Audit", description: "Check code for common security vulnerabilities", category: "Security", icon: "SA", prompt: "Audit this code for security vulnerabilities and suggest fixes." },
  { name: "Database Query Optimizer", description: "Optimize slow database queries", category: "Database", icon: "DQ", prompt: "Optimize this database query for better performance." },
  { name: "README Generator", description: "Create professional README files", category: "Documentation", icon: "RG", prompt: "Generate a comprehensive README.md for this project." },
];

async function seedTemplates() {
  const count = await Template.countDocuments({ isGlobal: true });
  if (count === 0) {
    await Template.insertMany(SEED_TEMPLATES.map(t => ({ ...t, isGlobal: true })));
  }
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    await seedTemplates();
    const category = req.query.category;
    const query = category && category !== "All" ? { isGlobal: true, category } : { isGlobal: true };
    const templates = await Template.find(query).sort({ useCount: -1 });
    res.json({ status: "success", data: templates });
  } catch (err) { next(err); }
});

router.post("/:id/use", requireAuth, async (req, res, next) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $inc: { useCount: 1 } },
      { new: true }
    );
    if (!template) return res.status(404).json({ status: "error", message: "Not found" });
    res.json({ status: "success", data: template });
  } catch (err) { next(err); }
});

module.exports = router;
