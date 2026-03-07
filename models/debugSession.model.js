const mongoose = require("mongoose");

const debugSessionSchema = new mongoose.Schema(
  {
    errorInput: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      default: null,
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    queries: {
      type: [String],
      default: [],
    },
    communityResults: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    rankedResults: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    solution: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    formattedOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      totalTime: { type: Number, default: 0 },
      agentTimings: { type: mongoose.Schema.Types.Mixed, default: {} },
      sourcesConsulted: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DebugSession", debugSessionSchema);
