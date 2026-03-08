const User = require("../models/user.model");
const logger = require("../utils/logger");

async function syncUser(req, res, next) {
  try {
    const { uid, email, name: tokenName } = req.user;
    const { name, avatar } = req.body || {};

    const displayName = name || tokenName || email?.split("@")[0];

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: { firebaseUid: uid },
        $set: {
          email,
          ...(displayName && { name: displayName }),
          ...(avatar && { avatar }),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    logger.error(`User sync failed: ${err.message}`);
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const allowed = ["name", "avatar", "bio", "role", "organization", "location", "website", "interests"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length > 0) {
      updates.profileComplete = true;
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: updates },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settingsUpdate = {};
    const allowed = ["notifications", "emailUpdates", "soundEffects", "autoSave", "twoFactor", "language", "aiModel", "responseLength"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        settingsUpdate[`settings.${key}`] = req.body[key];
      }
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: settingsUpdate },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    await User.findOneAndDelete({ firebaseUid: req.user.uid });
    res.status(200).json({ status: "success", message: "Account deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { syncUser, getMe, updateMe, updateSettings, deleteMe };
