const rateLimit = require("express-rate-limit");

const debugLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests. Please try again in a minute.",
  },
});

module.exports = { debugLimiter };
