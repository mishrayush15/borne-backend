require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { initFirebase } = require("./config/firebase-admin");
const debugRoutes = require("./routes/debug.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const documentRoutes = require("./routes/document.routes");
const templateRoutes = require("./routes/template.routes");
const communityRoutes = require("./routes/community.routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

initFirebase();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://air-borne-n28j.vercel.app',
    'https://air-borne.vercel.app',
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static("uploads"));

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
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/community", communityRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });
});
