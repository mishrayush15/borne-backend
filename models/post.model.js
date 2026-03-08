const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: "Anonymous" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: "Anonymous" },
    userAvatar: { type: String, default: "" },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    tags: [{ type: String }],
    likes: [{ type: String }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
