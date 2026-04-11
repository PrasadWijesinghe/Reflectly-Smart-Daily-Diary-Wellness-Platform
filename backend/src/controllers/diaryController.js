const prisma = require("../utils/prisma");
<<<<<<< HEAD
const {
  incrementDiaryEntriesCreated,
  incrementDiaryEntriesUpdated,
  incrementDiaryEntriesDeleted,
} = require("../utils/metrics");
=======
const { generateAISummary } = require("../utils/gemini");
const { invalidateWeekCache, regenerateWeekSummary } = require("./weeklyController");
>>>>>>> 9155e1b779a4e757d38b158c046e3bf87a6cc746

function generateSummary(content) {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const sentenceMatch = trimmed.match(/^(.+?[.!?])\s/);
  if (sentenceMatch && sentenceMatch[1].length <= 120) {
    return sentenceMatch[1];
  }

  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.substring(0, 120)}...`;
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

function getMoodColor(entry) {
  const content = `${entry.content || ""} ${entry.summary || ""}`.toLowerCase();

  if (content.includes("happy") || content.includes("grateful") || content.includes("great")) {
    return "#FCD34D";
  }
  if (content.includes("stress") || content.includes("anxious") || content.includes("overwhelmed")) {
    return "#F87171";
  }
  if (content.includes("calm") || content.includes("peaceful") || content.includes("relaxed")) {
    return "#34D399";
  }
  if (content.includes("tired") || content.includes("low energy")) {
    return "#9CA3AF";
  }

  return "#60A5FA";
}

function getMoodEmoji(entry) {
  const content = `${entry.content || ""} ${entry.summary || ""}`.toLowerCase();

  if (content.includes("happy") || content.includes("great") || content.includes("hopeful")) {
    return "😄";
  }
  if (content.includes("anxious") || content.includes("stress")) {
    return "😟";
  }
  if (content.includes("calm")) {
    return "😌";
  }
  if (content.includes("tired")) {
    return "😴";
  }
  if (entry.content) {
    return "🙂";
  }

  return null;
}

function getStressScore(entry) {
  const content = `${entry.content || ""} ${entry.summary || ""}`.toLowerCase();

  if (content.includes("anxious") || content.includes("stress") || content.includes("overwhelmed") || content.includes("panic") || content.includes("burnout")) {
    return 85;
  }
  if (content.includes("sad") || content.includes("frustrated") || content.includes("angry") || content.includes("tired")) {
    return 60;
  }
  if (content.includes("calm") || content.includes("peaceful") || content.includes("relaxed") || content.includes("grateful") || content.includes("hopeful")) {
    return 20;
  }
  if (entry.content) {
    return 35;
  }

  return 0;
}

function getStressLabel(percentage) {
  if (percentage >= 70) return "High";
  if (percentage >= 40) return "Moderate";
  if (percentage > 0) return "Light";
  return "No data";
}

function buildWeeklySuggestions(stressPercentage, hasEntries, hasHighStressEntry) {
  const suggestions = [];

  if (!hasEntries) {
    suggestions.push({
      title: "Write today’s diary",
      subtitle: "A quick entry gives the week more context.",
      icon: "create-outline",
      color: "#3B82F6",
      route: "/(tabs)/diary",
    });
    suggestions.push({
      title: "Try calm breathing",
      subtitle: "A short reset helps before the day gets busy.",
      icon: "leaf-outline",
      color: "#10B981",
      route: "/games/calm-breathing",
    });
    return suggestions;
  }

  if (stressPercentage >= 70 || hasHighStressEntry) {
    suggestions.push({
      title: "Use the breathing reset",
      subtitle: "Best first step when the week feels heavy.",
      icon: "leaf-outline",
      color: "#10B981",
      route: "/games/calm-breathing",
    });
    suggestions.push({
      title: "Open a quick game",
      subtitle: "A short puzzle can lower the pressure a bit.",
      icon: "game-controller-outline",
      color: "#3B82F6",
      route: "/(tabs)/games",
    });
    suggestions.push({
      title: "Write what is stressing you",
      subtitle: "Getting it out on the page can help organize it.",
      icon: "create-outline",
      color: "#8B5CF6",
      route: "/(tabs)/diary",
    });
    return suggestions;
  }

  if (stressPercentage >= 40) {
    suggestions.push({
      title: "Take a 5-minute break",
      subtitle: "A short pause can make the rest of the day easier.",
      icon: "time-outline",
      color: "#F59E0B",
      route: "/games/calm-breathing",
    });
    suggestions.push({
      title: "Play a quick game",
      subtitle: "A small puzzle can help you shift focus.",
      icon: "game-controller-outline",
      color: "#3B82F6",
      route: "/(tabs)/games",
    });
    suggestions.push({
      title: "Add a reminder",
      subtitle: "Set one small task to keep the week on track.",
      icon: "notifications-outline",
      color: "#8B5CF6",
      route: "/(tabs)/profile",
    });
    return suggestions;
  }

  suggestions.push({
    title: "Keep journaling daily",
    subtitle: "Your notes help the insights become more accurate.",
    icon: "journal-outline",
    color: "#3B82F6",
    route: "/(tabs)/diary",
  });
  suggestions.push({
    title: "Review this week’s progress",
    subtitle: "Small wins build a stronger routine over time.",
    icon: "analytics-outline",
    color: "#8B5CF6",
    route: "/(tabs)/insights",
  });
  suggestions.push({
    title: "Take a short walk",
    subtitle: "A little movement keeps the day balanced.",
    icon: "walk-outline",
    color: "#10B981",
    route: "/(tabs)/games",
  });
  return suggestions;
}

async function getEntryDates(req, res) {
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
}

async function getWeekMoods(req, res) {
  try {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);

    const entries = await prisma.dailyDiary.findMany({
      where: {
        userId: req.user.userId,
        date: { gte: start },
      },
      orderBy: { date: "asc" },
      include: { tags: true },
    });

    const weekMoods = entries.map((entry) => ({
      date: new Date(entry.date).toISOString().split("T")[0],
      color: getMoodColor(entry),
      filled: true,
    }));

    res.json({ weekMoods });
  } catch (err) {
    console.error("GetWeekMoods error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function getMoodTrend(req, res) {
  try {
    const requestedDays = Number.parseInt(req.query.days, 10);
    const days = Number.isFinite(requestedDays) && requestedDays > 0
      ? requestedDays
      : 7;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const start = new Date(today);

    const entries = await prisma.dailyDiary.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: start,
          lt: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + days)),
        },
      },
      orderBy: { date: "asc" },
    });

    const byDate = new Map(
      entries.map((entry) => [
        new Date(entry.date).toISOString().split("T")[0],
        entry,
      ])
    );

    const stressValues = entries.map((entry) => getStressScore(entry)).filter((value) => value > 0);
    const stressPercentage = stressValues.length
      ? Math.round(stressValues.reduce((sum, value) => sum + value, 0) / stressValues.length)
      : 0;
    const hasHighStressEntry = stressValues.some((value) => value >= 70);

    const responseDays = [];

    for (let index = 0; index < days; index += 1) {
      const current = new Date(start);
      current.setUTCDate(start.getUTCDate() + index);
      const key = current.toISOString().split("T")[0];
      const entry = byDate.get(key);

      responseDays.push({
        date: key,
        day: current.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        filled: Boolean(entry),
        mood: entry ? "logged" : null,
        emoji: entry ? "😊" : null,
        color: entry ? getMoodColor(entry) : "rgba(255,255,255,0.2)",
      });
    }

    res.json({
      days: responseDays,
      summary: {
        stressPercentage,
        stressLabel: getStressLabel(stressPercentage),
        hasEntries: entries.length > 0,
        hasHighStressEntry,
        suggestions: buildWeeklySuggestions(stressPercentage, entries.length > 0, hasHighStressEntry),
      },
    });
  } catch (err) {
    console.error("GetMoodTrend error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function getEntries(req, res) {
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
}

async function createEntry(req, res) {
  try {
    const { content, date, tagIds } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Diary content is required." });
    }

    const normalizedDate = normalizeDate(date);
    console.log(`[AI Summary] Generating summary for user ${req.user.userId}, date ${normalizedDate}`);
    const summary = await generateAISummary(content);
    console.log(`[AI Summary] Generated: "${summary}"`);
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

<<<<<<< HEAD
    incrementDiaryEntriesCreated();
=======
    await regenerateWeekSummary(req.user.userId, normalizedDate);

>>>>>>> 9155e1b779a4e757d38b158c046e3bf87a6cc746
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
}

async function getEntry(req, res) {
  try {
    const entry = await prisma.dailyDiary.findFirst({
      where: { id: parseInt(req.params.id, 10), userId: req.user.userId },
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
}

async function updateEntry(req, res) {
  try {
    const { content, tagIds } = req.body;

    const existing = await prisma.dailyDiary.findFirst({
      where: { id: parseInt(req.params.id, 10), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Entry not found." });
    }

    const updateData = {};
    if (content !== undefined) {
      updateData.content = content;
      console.log(`[AI Summary] Generating summary for entry ${existing.id}, user ${req.user.userId}`);
      updateData.summary = await generateAISummary(content);
      console.log(`[AI Summary] Generated: "${updateData.summary}"`);
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

<<<<<<< HEAD
    incrementDiaryEntriesUpdated();
=======
    await regenerateWeekSummary(req.user.userId, existing.date);

>>>>>>> 9155e1b779a4e757d38b158c046e3bf87a6cc746
    res.json({ message: "Entry updated.", entry });
  } catch (err) {
    console.error("UpdateEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function deleteEntry(req, res) {
  try {
    const existing = await prisma.dailyDiary.findFirst({
      where: { id: parseInt(req.params.id, 10), userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Entry not found." });
    }

    await prisma.dailyDiary.delete({ where: { id: existing.id } });

<<<<<<< HEAD
    incrementDiaryEntriesDeleted();
=======
    await regenerateWeekSummary(req.user.userId, existing.date);

>>>>>>> 9155e1b779a4e757d38b158c046e3bf87a6cc746
    res.json({ message: "Entry deleted." });
  } catch (err) {
    console.error("DeleteEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  createEntry,
  deleteEntry,
  getEntries,
  getEntry,
  getEntryDates,
  getMoodTrend,
  getWeekMoods,
  updateEntry,
};
