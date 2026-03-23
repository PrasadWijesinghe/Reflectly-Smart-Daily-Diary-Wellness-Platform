const express = require("express");
const { getTags, createTag, updateTag, deleteTag } = require("../controllers/tagController");
const authenticate = require("../middleware/auth");

const router = express.Router();

// All tag routes require authentication
router.use(authenticate);

router.get("/", getTags);
router.post("/", createTag);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

module.exports = router;
