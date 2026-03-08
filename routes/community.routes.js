const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Post = require("../models/post.model");
const User = require("../models/user.model");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    res.json({ status: "success", data: posts });
  } catch (err) { next(err); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const post = await Post.create({
      userId: req.user.uid,
      userName: user?.name || req.user.name || "Anonymous",
      userAvatar: user?.avatar || "",
      title: req.body.title,
      content: req.body.content || "",
      tags: req.body.tags || [],
    });
    res.status(201).json({ status: "success", data: post });
  } catch (err) { next(err); }
});

router.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: "error", message: "Not found" });

    const uid = req.user.uid;
    const idx = post.likes.indexOf(uid);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(uid);
    }
    await post.save();
    res.json({ status: "success", data: post });
  } catch (err) { next(err); }
});

router.post("/:id/comment", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: "error", message: "Not found" });

    post.comments.push({
      userId: req.user.uid,
      userName: user?.name || "Anonymous",
      text: req.body.text,
    });
    await post.save();
    res.json({ status: "success", data: post });
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!post) return res.status(404).json({ status: "error", message: "Not found" });
    res.json({ status: "success", message: "Deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
