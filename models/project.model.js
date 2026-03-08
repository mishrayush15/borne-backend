const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Completed"],
      default: "Planning",
    },
    members: { type: Number, default: 1 },
    icon: { type: String, default: "NP" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
