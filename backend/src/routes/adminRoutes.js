const express = require("express");
const { login, getUsers } = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/adminAuth");

const router = express.Router();

router.post("/login", login);
router.get("/users", authenticateAdmin, getUsers);

module.exports = router;
