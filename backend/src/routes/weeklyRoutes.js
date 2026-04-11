const express = require("express");
const router = express.Router();
const { getWeeklyEntries } = require("../controllers/weeklyController");
const authMiddleware = require("../middleware/auth");

router.get("/weekly", authMiddleware, getWeeklyEntries);

module.exports = router;