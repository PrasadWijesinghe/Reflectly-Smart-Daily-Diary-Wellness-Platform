const express = require("express");
const {
	register,
	login,
	getMe,
	sendRegistrationOtp,
	sendForgotPasswordOtp,
	verifyForgotPasswordOtp,
	resetPasswordWithOtp,
} = require("../controllers/authController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/send-otp", sendRegistrationOtp);
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
router.post("/login", login);
router.get("/me", authenticate, getMe);

module.exports = router;
