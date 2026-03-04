const express = require("express");
const {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/diaryController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// All diary routes require authentication
router.use(authenticate);

router.post("/", createEntry);
router.get("/", getEntries);
router.get("/:id", getEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

module.exports = router;
