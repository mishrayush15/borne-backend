const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    role: { type: String, default: "" },
    organization: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    interests: [{ type: String }],
    profileComplete: { type: Boolean, default: false },
    settings: {
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: false },
      soundEffects: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: true },
      twoFactor: { type: Boolean, default: false },
      language: { type: String, default: "English" },
      aiModel: { type: String, default: "Gemini" },
      responseLength: { type: String, default: "Balanced" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
