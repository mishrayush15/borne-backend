require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const debugRoutes = require("./routes/debug.routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const isHealthy = mongoState === 1;

  const healthCheck = {
    status: isHealthy ? "healthy" : "unhealthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: mongoStatus[mongoState] || "unknown",
        healthy: isHealthy,
      },
    },
  };

  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

app.use("/api/debug", debugRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });
});
