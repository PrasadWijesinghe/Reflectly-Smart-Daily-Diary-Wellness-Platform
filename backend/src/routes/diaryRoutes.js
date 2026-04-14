const express = require("express");
const {
  createEntry,
  getEntries,
  getEntry,
  getEntryDates,
  getMoodTrend,
  getWeekMoods,
  updateEntry,
  deleteEntry,
  getWeeklyEntries,
  getMonthlyMoods,
} = require("../controllers/diaryController");
const { getWeeklyEntries: getWeeklySummary } = require("../controllers/weeklyController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// All diary routes require authentication
router.use(authenticate);

router.get("/mood-trend", getMoodTrend);
router.get("/week-moods", getWeekMoods);
router.get("/dates", getEntryDates);
router.get("/monthly-moods", getMonthlyMoods);
router.post("/", createEntry);
// Weekly summary endpoint
router.get("/weekly", getWeeklySummary);
router.get("/", getEntries);
router.get("/:id", getEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

module.exports = router;
