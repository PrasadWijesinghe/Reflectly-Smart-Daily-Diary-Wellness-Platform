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
} = require("../controllers/diaryController");
const { getWeeklyEntries: getWeeklySummary } = require("../controllers/weeklyController");
const { uploadMiddleware, uploadImages, deleteImage } = require("../controllers/imageController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// All diary routes require authentication
router.use(authenticate);

router.get("/mood-trend", getMoodTrend);
router.get("/week-moods", getWeekMoods);
router.get("/dates", getEntryDates);
router.post("/", createEntry);
// Weekly summary endpoint
router.get("/weekly", getWeeklySummary);
router.get("/", getEntries);
router.get("/:id", getEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);
router.post("/:id/images", uploadMiddleware, uploadImages);
router.delete("/images/:imageId", deleteImage);

module.exports = router;
