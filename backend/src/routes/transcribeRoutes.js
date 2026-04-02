const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { transcribe } = require("../controllers/transcribeController");
const authenticate = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `audio-${uniqueSuffix}.m4a`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed."));
    }
  },
});

router.post("/transcribe", authenticate, upload.single("audio"), transcribe);

module.exports = router;
