const prisma = require("../utils/prisma");

// POST /api/diary
const createEntry = async (req, res) => {
  try {
    const { text, mood, tags } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Diary text is required." });
    }

    const entry = await prisma.diaryEntry.create({
      data: {
        text,
        mood: mood || null,
        tags: tags || [],
        userId: req.user.userId,
      },
    });

    res.status(201).json({ message: "Entry saved.", entry });
  } catch (err) {
    console.error("CreateEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// GET /api/diary
const getEntries = async (req, res) => {
  try {
    const entries = await prisma.diaryEntry.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ entries });
  } catch (err) {
    console.error("GetEntries error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// GET /api/diary/:id
const getEntry = async (req, res) => {
  try {
    const entry = await prisma.diaryEntry.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found." });
    }

    res.json({ entry });
  } catch (err) {
    console.error("GetEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// PUT /api/diary/:id
const updateEntry = async (req, res) => {
  try {
    const { text, mood, tags } = req.body;

    const existing = await prisma.diaryEntry.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Entry not found." });
    }

    const entry = await prisma.diaryEntry.update({
      where: { id: existing.id },
      data: {
        ...(text !== undefined && { text }),
        ...(mood !== undefined && { mood }),
        ...(tags !== undefined && { tags }),
      },
    });

    res.json({ message: "Entry updated.", entry });
  } catch (err) {
    console.error("UpdateEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// DELETE /api/diary/:id
const deleteEntry = async (req, res) => {
  try {
    const existing = await prisma.diaryEntry.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Entry not found." });
    }

    await prisma.diaryEntry.delete({ where: { id: existing.id } });

    res.json({ message: "Entry deleted." });
  } catch (err) {
    console.error("DeleteEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };
