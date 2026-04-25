const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const tagRoutes = require("./routes/tagRoutes");
const transcribeRoutes = require("./routes/transcribeRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const { register, recordHttpMetrics } = require("./utils/metrics");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging + Prometheus metrics
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const elapsedSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    recordHttpMetrics({
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      durationSeconds: elapsedSeconds,
    });
  });

  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Reflectly API is running 🚀" });
});

// Prometheus scrape endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", transcribeRoutes);

module.exports = app;
