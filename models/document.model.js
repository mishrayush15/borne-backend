const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, default: "file" },
    size: { type: String, default: "0 KB" },
    shared: { type: Boolean, default: false },
    filePath: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
