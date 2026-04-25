const express = require("express");
const { login, getUsers, getTags, createTag, getFeedbacks } = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/adminAuth");

const router = express.Router();

router.post("/login", login);
router.get("/users", authenticateAdmin, getUsers);
router.get("/tags", authenticateAdmin, getTags);
router.post("/tags", authenticateAdmin, createTag);
router.get("/feedback", authenticateAdmin, getFeedbacks);

module.exports = router;
