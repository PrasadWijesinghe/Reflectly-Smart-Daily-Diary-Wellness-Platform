const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const transcribeRoutes = require("./routes/transcribeRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Reflectly API is running 🚀" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api", transcribeRoutes);

module.exports = app;
