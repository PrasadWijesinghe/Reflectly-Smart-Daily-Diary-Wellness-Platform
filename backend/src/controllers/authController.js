const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const transporter = require("../utils/mailer");
const { incrementAuthEvent } = require("../utils/metrics");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
const OTP_REGEX = /^\d{6}$/;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const otpStore = new Map();
const forgotPasswordOtpStore = new Map();
const APP_LOCK_PIN_REGEX = /^\d{4}$/;
const APP_LOCK_PASSWORD_MIN_LENGTH = 6;

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    appLockEnabled: Boolean(user.appLockEnabled),
    appLockType: user.appLockType || null,
  };
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim());
}

function isStrongPassword(password) {
  return STRONG_PASSWORD_REGEX.test(String(password || ""));
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isOtpValid(email, otp) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  return record.code === otp;
}

function isOtpValidFromStore(store, email, otp) {
  const record = store.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    store.delete(email);
    return false;
  }
  return record.code === otp;
}

function getRemainingCooldownMs(store, email) {
  const record = store.get(email);
  if (!record) return 0;
  const elapsed = Date.now() - record.lastSentAt;
  return Math.max(0, OTP_RESEND_COOLDOWN_MS - elapsed);
}

function validateAppLock(type, secret) {
  if (!type || !secret) {
    return "Lock type and value are required.";
  }

  if (type === "pin") {
    return APP_LOCK_PIN_REGEX.test(String(secret).trim())
      ? null
      : "PIN must be exactly 4 digits.";
  }

  if (type === "password") {
    return String(secret).length >= APP_LOCK_PASSWORD_MIN_LENGTH
      ? null
      : "App password must be at least 6 characters.";
  }

  return "Lock type must be pin or password.";
}

const sendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: "SMTP is not configured on the backend." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const remainingCooldownMs = getRemainingCooldownMs(otpStore, normalizedEmail);
    if (remainingCooldownMs > 0) {
      return res.status(429).json({ error: "Please wait before requesting another OTP." });
    }

    const otpCode = generateOtp();
    const expiresAt = Date.now() + OTP_TTL_MS;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: normalizedEmail,
      subject: "Reflectly OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
          <h2 style="margin: 0 0 8px; color: #1d4ed8;">Verify your Reflectly account</h2>
          <p style="margin: 0 0 12px;">Use the OTP below to complete your registration:</p>
          <div style="display: inline-block; padding: 10px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 24px; letter-spacing: 4px; font-weight: 700; color: #1e3a8a;">
            ${otpCode}
          </div>
          <p style="margin: 12px 0 0;">This OTP expires in 10 minutes.</p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    otpStore.set(normalizedEmail, {
      code: otpCode,
      expiresAt,
      lastSentAt: Date.now(),
    });

    incrementAuthEvent("send_otp", "success");
    return res.json({ message: "OTP sent successfully.", expiresInSeconds: OTP_TTL_MS / 1000 });
  } catch (err) {
    console.error("SendRegistrationOtp error:", err);
    incrementAuthEvent("send_otp", "failure");
    return res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ error: "SMTP is not configured on the backend." });
    }

    const remainingCooldownMs = getRemainingCooldownMs(forgotPasswordOtpStore, normalizedEmail);
    if (remainingCooldownMs > 0) {
      return res.status(429).json({ error: "Please wait before requesting another OTP." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!existingUser) {
      return res.json({
        message: "If this email exists, an OTP has been sent.",
        expiresInSeconds: OTP_TTL_MS / 1000,
      });
    }

    const otpCode = generateOtp();
    const expiresAt = Date.now() + OTP_TTL_MS;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: normalizedEmail,
      subject: "Reflectly Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
          <h2 style="margin: 0 0 8px; color: #1d4ed8;">Reset your Reflectly password</h2>
          <p style="margin: 0 0 12px;">Use this OTP to reset your password:</p>
          <div style="display: inline-block; padding: 10px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 24px; letter-spacing: 4px; font-weight: 700; color: #1e3a8a;">
            ${otpCode}
          </div>
          <p style="margin: 12px 0 0;">This OTP expires in 10 minutes.</p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    forgotPasswordOtpStore.set(normalizedEmail, {
      code: otpCode,
      expiresAt,
      lastSentAt: Date.now(),
    });

    incrementAuthEvent("forgot_password_send_otp", "success");
    return res.json({ message: "OTP sent successfully.", expiresInSeconds: OTP_TTL_MS / 1000 });
  } catch (err) {
    console.error("SendForgotPasswordOtp error:", err);
    incrementAuthEvent("forgot_password_send_otp", "failure");
    return res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const otpValue = String(otp || "").trim();

    if (!normalizedEmail || !otpValue) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!OTP_REGEX.test(otpValue)) {
      return res.status(400).json({ error: "OTP must be a 6-digit code." });
    }

    if (!isOtpValidFromStore(forgotPasswordOtpStore, normalizedEmail, otpValue)) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    incrementAuthEvent("forgot_password_verify_otp", "success");
    return res.json({ message: "OTP verified." });
  } catch (err) {
    console.error("VerifyForgotPasswordOtp error:", err);
    incrementAuthEvent("forgot_password_verify_otp", "failure");
    return res.status(500).json({ error: "Failed to verify OTP." });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const otpValue = String(otp || "").trim();

    if (!normalizedEmail || !otpValue || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!OTP_REGEX.test(otpValue)) {
      return res.status(400).json({ error: "OTP must be a 6-digit code." });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, and a symbol.",
      });
    }

    if (!isOtpValidFromStore(forgotPasswordOtpStore, normalizedEmail, otpValue)) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    forgotPasswordOtpStore.delete(normalizedEmail);

    incrementAuthEvent("forgot_password_reset", "success");
    return res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("ResetPasswordWithOtp error:", err);
    incrementAuthEvent("forgot_password_reset", "failure");
    return res.status(500).json({ error: "Failed to reset password." });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: "Name, email, password, and OTP are required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, and a symbol.",
      });
    }

    if (!OTP_REGEX.test(String(otp).trim())) {
      return res.status(400).json({ error: "OTP must be a 6-digit code." });
    }

    if (!isOtpValid(normalizedEmail, String(otp).trim())) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword },
    });

    otpStore.delete(normalizedEmail);
    incrementAuthEvent("register", "success");

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Register error:", err);
    incrementAuthEvent("register", "failure");
    res.status(500).json({ error: "Internal server error." });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, and a symbol.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    incrementAuthEvent("login", "success");
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    incrementAuthEvent("login", "failure");
    res.status(500).json({ error: "Internal server error." });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        appLockEnabled: true,
        appLockType: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    incrementAuthEvent("me", "success");
    res.json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    incrementAuthEvent("me", "failure");
    res.status(500).json({ error: "Internal server error." });
  }
};

const setupAppLock = async (req, res) => {
  try {
    const { type, secret } = req.body;
    const validationError = validateAppLock(type, secret);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const hash = await bcrypt.hash(String(secret), 10);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        appLockEnabled: true,
        appLockType: type,
        appLockHash: hash,
      },
    });

    incrementAuthEvent("app_lock_setup", "success");
    return res.json({
      message: "App lock updated.",
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("SetupAppLock error:", err);
    incrementAuthEvent("app_lock_setup", "failure");
    return res.status(500).json({ error: "Failed to update app lock." });
  }
};

const disableAppLock = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        appLockEnabled: false,
        appLockType: null,
        appLockHash: null,
      },
    });

    incrementAuthEvent("app_lock_disable", "success");
    return res.json({
      message: "App lock disabled.",
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("DisableAppLock error:", err);
    incrementAuthEvent("app_lock_disable", "failure");
    return res.status(500).json({ error: "Failed to disable app lock." });
  }
};

const verifyAppLock = async (req, res) => {
  try {
    const { secret } = req.body;

    if (!secret) {
      return res.status(400).json({ error: "Lock value is required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        appLockEnabled: true,
        appLockType: true,
        appLockHash: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.appLockEnabled || !user.appLockHash) {
      return res.status(400).json({ error: "App lock is not enabled." });
    }

    const isMatch = await bcrypt.compare(String(secret), user.appLockHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect app lock value." });
    }

    incrementAuthEvent("app_lock_verify", "success");
    return res.json({
      message: "App lock verified.",
      appLockType: user.appLockType || null,
    });
  } catch (err) {
    console.error("VerifyAppLock error:", err);
    incrementAuthEvent("app_lock_verify", "failure");
    return res.status(500).json({ error: "Failed to verify app lock." });
  }
};

module.exports = {
  register,
  login,
  getMe,
  setupAppLock,
  disableAppLock,
  verifyAppLock,
  sendRegistrationOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
};
