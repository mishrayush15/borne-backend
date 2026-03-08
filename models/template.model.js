const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    icon: { type: String, default: "" },
    prompt: { type: String, default: "" },
    useCount: { type: Number, default: 0 },
    isGlobal: { type: Boolean, default: true },
    userId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
