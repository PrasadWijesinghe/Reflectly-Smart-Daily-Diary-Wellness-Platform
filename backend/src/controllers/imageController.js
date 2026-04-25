const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const multer = require('multer');
const prisma = require('../utils/prisma');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const MAX_IMAGES_PER_ENTRY = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${randomId}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error('Invalid file type.'), { code: 'INVALID_TYPE' }), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const uploadMiddleware = upload.array('images', MAX_IMAGES_PER_ENTRY);

async function uploadImages(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  try {
    const entryId = parseInt(req.params.id, 10);

    const diary = await prisma.dailyDiary.findFirst({
      where: { id: entryId },
    });

    if (!diary) {
      for (const f of req.files) fs.unlink(f.path, () => {});
      return res.status(404).json({ error: 'Entry not found.' });
    }

    if (diary.userId !== req.user.userId) {
      for (const f of req.files) fs.unlink(f.path, () => {});
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const existingCount = await prisma.diaryImage.count({
      where: { diaryId: entryId },
    });

    if (existingCount + req.files.length > MAX_IMAGES_PER_ENTRY) {
      for (const f of req.files) fs.unlink(f.path, () => {});
      return res.status(400).json({ error: 'Too many images. Max 5 per entry.' });
    }

    const created = await Promise.all(
      req.files.map((file, index) =>
        prisma.diaryImage.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            order: existingCount + index,
            diaryId: entryId,
          },
        })
      )
    );

    const images = created.map((img) => ({
      ...img,
      url: `/uploads/${img.filename}`,
    }));

    res.json({ images });
  } catch (err) {
    for (const f of req.files) fs.unlink(f.path, () => {});
    console.error('UploadImages error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

async function deleteImage(req, res) {
  try {
    const imageId = parseInt(req.params.imageId, 10);

    const image = await prisma.diaryImage.findFirst({
      where: { id: imageId },
      include: { diary: true },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    if (image.diary.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const filePath = path.join(UPLOADS_DIR, image.filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('File delete warning:', err.message);
      }
    });

    await prisma.diaryImage.delete({ where: { id: imageId } });

    res.json({ message: 'Image deleted.' });
  } catch (err) {
    console.error('DeleteImage error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { uploadMiddleware, uploadImages, deleteImage };
