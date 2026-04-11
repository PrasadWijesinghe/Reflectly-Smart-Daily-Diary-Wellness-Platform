const prisma = require("../utils/prisma");
const { analyzeMood } = require("../utils/moodAnalyzer");

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return weekNum;
}

function getMonthWeekNumber(date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  // Find first Sunday of the month
  let firstSunday = new Date(firstDay);
  if (firstDay.getUTCDay() !== 0) {
    firstSunday.setUTCDate(firstDay.getUTCDate() + (7 - firstDay.getUTCDay()));
  }

  // If date is in week 1 (before or on first Sunday)
  if (d <= firstSunday) {
    return 1;
  }

  // Find last Monday of the month (matches getWeekRange formula)
  let lastMonday = new Date(lastDay);
  const lastDayOfWeek = lastDay.getUTCDay();
  const daysBack = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
  lastMonday.setUTCDate(lastDay.getUTCDate() - daysBack);

  // If date is in last week (from last Monday onwards)
  if (d >= lastMonday) {
    const totalDays = (lastMonday - firstSunday) / (1000 * 60 * 60 * 24);
    return Math.floor(totalDays / 7) + 2;
  }

  // Middle weeks: count from first Sunday
  const daysSinceFirstSunday = (d - firstSunday) / (1000 * 60 * 60 * 24);
  return Math.floor(daysSinceFirstSunday / 7) + 2;
}

function getWeekRange(year, month, weekNumber) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  let weekStart, weekEnd;

  if (weekNumber === 1) {
    // Week 1: 1st of month to first Sunday
    weekStart = new Date(firstDay);
    if (firstDay.getUTCDay() === 0) {
      weekEnd = new Date(firstDay);
    } else {
      weekEnd = new Date(firstDay);
      weekEnd.setUTCDate(firstDay.getUTCDate() + (7 - firstDay.getUTCDay()));
    }
  } else {
    // Find first Sunday
    let firstSunday = new Date(firstDay);
    if (firstDay.getUTCDay() !== 0) {
      firstSunday.setUTCDate(firstDay.getUTCDate() + (7 - firstDay.getUTCDay()));
    }

    // Find last Monday
    let lastMonday = new Date(lastDay);
    const lastDayOfWeek = lastDay.getUTCDay();
    const daysBack = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
    lastMonday.setUTCDate(lastDay.getUTCDate() - daysBack);

    // Check if this is the last week
    const daysBetween = (lastMonday - firstSunday) / (1000 * 60 * 60 * 24);
    const maxWeeks = Math.floor(daysBetween / 7) + 2;

    if (weekNumber === maxWeeks) {
      // Last week: last Monday to month end
      weekStart = new Date(lastMonday);
      weekEnd = new Date(lastDay);
    } else {
      // Middle weeks: Monday to Sunday
      const weekOffset = weekNumber - 2;
      weekStart = new Date(firstSunday);
      weekStart.setUTCDate(firstSunday.getUTCDate() + 1 + (weekOffset * 7));
      weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    }
  }

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    dayCount: Math.ceil((weekEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1
  };
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

async function generateAISummary(entries) {
  if (entries.length === 0) {
    return {
      shortSummary: "No entries this week.",
      fullSummary: "No diary entries were recorded this week.",
      mood: "Neutral 😐"
    };
  }

  const summaries = entries.map(e => e.summary).filter(s => s);
  const allContent = entries.map(e => e.content).filter(c => c).join("\n\n");
  
  if (summaries.length === 0) {
    return {
      shortSummary: "A quiet week with no detailed entries.",
      fullSummary: "This week had diary entries but no summaries were recorded.",
      mood: "Neutral 😐"
    };
  }

  const combinedText = summaries.join(" ");
  const entryCount = entries.length;

  try {
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const prompt = `
You are analyzing a week's worth of diary entries. Based on the summaries below, create a comprehensive weekly summary.

Entry summaries:
${summaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Instructions:
1. Create a SHORT summary (3-4 lines) that captures the overall theme/feeling of the week
2. Create a FULL summary (1-2 paragraphs) that describes what happened, how the person felt, and the key moments of the week
3. Consider the tone, topics discussed, and any patterns you notice
4. Do not use bullet points or lists in your response

Respond in this exact JSON format (no markdown, just clean JSON):
{
  "shortSummary": "3-4 line summary here...",
  "fullSummary": "Full paragraph summary here...",
  "mood": "single mood emoji word pair like 'Happy 😄' or 'Stressed 😫'"
}
    `.trim();

    let retries = 3;
    let response;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.3
          }
        });
        break;
      } catch (apiError) {
        if (apiError.status === 503 && retries > 1) {
          console.log(`AI API retrying, ${retries} attempts left...`);
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw apiError;
        }
      }
    }

    let result = response.text.trim();
    
    result = result.replace(/```json/g, "").replace(/```/g, "").trim();
    
    if (result.startsWith("```")) {
      result = result.replace(/```\w*\n?/g, "").trim();
    }

    const parsed = JSON.parse(result);
    
    return {
      shortSummary: parsed.shortSummary || "A varied week with different activities.",
      fullSummary: parsed.fullSummary || "This week had various entries covering different topics.",
      mood: parsed.mood || "Neutral 😐"
    };
  } catch (error) {
    console.error("AI Summary Generation Error:", error);
    
    const tagCounts = {};
    entries.forEach(e => {
      e.tags.forEach(t => {
        tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const mainActivity = topTags.length > 0 ? topTags[0][0] : "Resting";
    
    return {
      shortSummary: `This week focused mainly on ${mainActivity.toLowerCase()}. ${entryCount} ${entryCount === 1 ? "entry was" : "entries were"} recorded.`,
      fullSummary: `Over ${entryCount} ${entryCount === 1 ? "day" : "days"}, you recorded your thoughts and experiences. The main theme was ${mainActivity.toLowerCase()}. This week had a mix of activities and emotions as you documented your daily life.`,
      mood: "Neutral 😐"
    };
  }
}

function calculateTopTags(entries, allTags) {
  const tagCounts = {};
  
  entries.forEach(entry => {
    entry.tags.forEach(tag => {
      tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
    });
  });
  
  const sorted = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return sorted.map(([name, count]) => {
    const tag = allTags.find(t => t.name === name);
    return {
      name,
      count,
      icon: tag?.icon || "📝",
      color: tag?.color || "#3B82F6"
    };
  });
}

async function generateWeekSummary(userId, year, month, weekNumber, entries, allTags) {
  const range = getWeekRange(year, month, weekNumber);
  if (!range) return null;

  const { shortSummary, fullSummary, mood } = await generateAISummary(entries);
  const topTags = calculateTopTags(entries, allTags);

  const summaryData = {
    userId,
    year,
    month,
    weekNumber,
    weekStart: new Date(range.weekStart),
    weekEnd: new Date(range.weekEnd),
    dayCount: range.dayCount,
    shortSummary,
    fullSummary,
    topTags: JSON.stringify(topTags),
    mood,
    entryCount: entries.length
  };

  return prisma.weeklySummary.upsert({
    where: {
      userId_year_month_weekNumber: {
        userId,
        year,
        month,
        weekNumber
      }
    },
    update: summaryData,
    create: summaryData
  });
}

async function getWeeklyEntries(req, res) {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required." });
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const userId = req.user.userId;

    const cachedSummaries = await prisma.weeklySummary.findMany({
      where: {
        userId,
        year: yearNum,
        month: monthNum
      },
      orderBy: { weekNumber: "asc" }
    });

    if (cachedSummaries.length > 0) {
      const weeks = cachedSummaries.map(s => ({
        weekNumber: s.weekNumber,
        weekStart: s.weekStart.toISOString().split("T")[0],
        weekEnd: s.weekEnd.toISOString().split("T")[0],
        dayCount: s.dayCount,
        shortSummary: s.shortSummary,
        fullSummary: s.fullSummary,
        topTags: JSON.parse(s.topTags),
        mood: s.mood,
        entryCount: s.entryCount
      }));

      return res.json({ weeks });
    }

    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0);

    const entries = await prisma.dailyDiary.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tags: true
      }
    });

    const allTags = await prisma.tag.findMany();

    const monthStart = new Date(yearNum, monthNum, 1);
    const monthEnd = new Date(yearNum, monthNum + 1, 0);
    
    const firstDay = monthStart;
    let firstSunday = new Date(firstDay);
    if (firstDay.getDay() !== 0) {
      firstSunday.setDate(firstDay.getDate() + (7 - firstDay.getDay()));
    }
    
    let lastMonday = new Date(monthEnd);
    if (monthEnd.getDay() !== 0) {
      lastMonday.setDate(monthEnd.getDate() - monthEnd.getDay());
    }
    
    const daysBetween = (lastMonday - firstSunday) / (1000 * 60 * 60 * 24);
    const totalWeeks = Math.floor(daysBetween / 7) + 2;
    
    const weeks = [];
    
    for (let weekNumber = 1; weekNumber <= totalWeeks; weekNumber++) {
      const range = getWeekRange(yearNum, monthNum, weekNumber);
      if (!range) continue;
      
      const weekStartDate = new Date(range.weekStart);
      const weekEndDate = new Date(range.weekEnd);
      
      const weekEntries = entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate >= weekStartDate && entryDate <= weekEndDate;
      });

      if (weekEntries.length > 0 || weekStartDate.getMonth() === monthNum) {
        const summary = await generateWeekSummary(
          userId,
          yearNum,
          monthNum,
          weekNumber,
          weekEntries,
          allTags
        );

        if (summary) {
          weeks.push({
            weekNumber: summary.weekNumber,
            weekStart: summary.weekStart.toISOString().split("T")[0],
            weekEnd: summary.weekEnd.toISOString().split("T")[0],
            dayCount: summary.dayCount,
            shortSummary: summary.shortSummary,
            fullSummary: summary.fullSummary,
            topTags: JSON.parse(summary.topTags),
            mood: summary.mood,
            entryCount: summary.entryCount
          });
        }
      }
    }

    res.json({ weeks });
  } catch (err) {
    console.error("GetWeeklyEntries error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function invalidateWeekCache(userId, entryDate) {
  try {
    const date = new Date(entryDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const weekNumber = getMonthWeekNumber(date);

    await prisma.weeklySummary.deleteMany({
      where: {
        userId,
        year,
        month,
        weekNumber
      }
    });

    console.log(`Cache invalidated for user ${userId}, week ${weekNumber} of ${month + 1}/${year}`);
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
}

async function regenerateWeekSummary(userId, entryDate) {
  try {
    const date = new Date(entryDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const weekNumber = getMonthWeekNumber(date);

    const range = getWeekRange(year, month, weekNumber);
    if (!range) return;

    const weekStartDate = new Date(range.weekStart);
    const weekEndDate = new Date(range.weekEnd);

    const allEntries = await prisma.dailyDiary.findMany({
      where: {
        userId,
        date: {
          gte: weekStartDate,
          lte: weekEndDate
        }
      },
      include: {
        tags: true
      }
    });

    const allTags = await prisma.tag.findMany();

    const summary = await generateWeekSummary(
      userId,
      year,
      month,
      weekNumber,
      allEntries,
      allTags
    );

    if (summary) {
      console.log(`Weekly summary regenerated for user ${userId}, week ${weekNumber} of ${month + 1}/${year}`);
    }
  } catch (err) {
    console.error("Regenerate weekly summary error:", err);
  }
}

module.exports = { getWeeklyEntries, invalidateWeekCache, regenerateWeekSummary };