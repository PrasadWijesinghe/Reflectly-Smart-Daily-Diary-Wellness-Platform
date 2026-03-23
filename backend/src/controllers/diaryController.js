const prisma = require("../utils/prisma");

function generateSummary(content) {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const sentenceMatch = trimmed.match(/^(.+?[.!?])\s/);
  if (sentenceMatch && sentenceMatch[1].length <= 120) {
    return sentenceMatch[1];
  }

  if (trimmed.length <= 120) return trimmed;
  return trimmed.substring(0, 120) + "...";
}

function normalizeDate(dateStr) {
  if (dateStr) {
    const dateOnly = dateStr.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// GET /api/diary/dates
const getEntryDates = async (req, res) => {
  try {
    const entries = await prisma.dailyDiary.findMany({
      where: { userId: req.user.userId },
      select: { date: true },
    });

    const dates = entries.map((e) => {
      const d = new Date(e.date);
      return d.toISOString().split("T")[0];
    });

    res.json({ dates });
  } catch (err) {
    console.error("GetEntryDates error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// GET /api/diary?date=2026-03-22
const getEntries = async (req, res) => {
  try {
    const { date } = req.query;

    if (date) {
      const d = normalizeDate(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const entry = await prisma.dailyDiary.findFirst({
        where: {
          userId: req.user.userId,
          date: { gte: d, lt: nextDay },
        },
        include: { tags: true },
      });

      return res.json({ entry: entry || null });
    }

    const entries = await prisma.dailyDiary.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
      include: { tags: true },
    });

    res.json({ entries });
  } catch (err) {
    console.error("GetEntries error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// POST /api/diary
const createEntry = async (req, res) => {
  try {
    const { content, date, tagIds } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Diary content is required." });
    }

    const normalizedDate = normalizeDate(date);
    const summary = generateSummary(content);
    const tagConnect =
      tagIds && tagIds.length > 0
        ? { connect: tagIds.map((id) => ({ id })) }
        : undefined;

    const existing = await prisma.dailyDiary.findFirst({
      where: {
        userId: req.user.userId,
        date: normalizedDate,
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "An entry already exists for this date." });
    }

    const entry = await prisma.dailyDiary.create({
      data: {
        content,
        summary,
        date: normalizedDate,
        userId: req.user.userId,
        ...(tagConnect && { tags: tagConnect }),
      },
      include: { tags: true },
    });

    res.status(201).json({ message: "Entry saved.", entry });
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ error: "An entry already exists for this date." });
    }
    console.error("CreateEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// GET /api/diary/:id
const getEntry = async (req, res) => {
  try {
    const entry = await prisma.dailyDiary.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
      include: { tags: true },
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
    const { content, tagIds } = req.body;

    const existing = await prisma.dailyDiary.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Entry not found." });
    }

    const updateData = {};
    if (content !== undefined) {
      updateData.content = content;
      updateData.summary = generateSummary(content);
    }
    if (tagIds !== undefined) {
      updateData.tags = {
        set: tagIds.map((id) => ({ id })),
      };
    }

    const entry = await prisma.dailyDiary.update({
      where: { id: existing.id },
      data: updateData,
      include: { tags: true },
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
    const existing = await prisma.dailyDiary.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Entry not found." });
    }

    await prisma.dailyDiary.delete({ where: { id: existing.id } });

    res.json({ message: "Entry deleted." });
  } catch (err) {
    console.error("DeleteEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntry,
  getEntryDates,
  updateEntry,
  deleteEntry,
};
