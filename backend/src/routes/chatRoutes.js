const express = require("express");
const authenticate = require("../middleware/auth");
const { createChatReply } = require("../controllers/chatController");

const router = express.Router();

router.use(authenticate);
router.post("/", createChatReply);

module.exports = router;
