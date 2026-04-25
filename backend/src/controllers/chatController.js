const prisma = require("../utils/prisma");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const RAW_GEMINI_MODEL =
  process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || "gemini-2.5-flash";

function normalizeGeminiModelName(modelName) {
  const normalized = String(modelName || "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "gemini-2.5-flash";
  }

  if (normalized === "gemini-2.5-flash-latest") {
    return "gemini-2.5-flash";
  }

  if (normalized === "gemini-2.5-pro-latest") {
    return "gemini-2.5-pro";
  }

  if (normalized.startsWith("gemini-")) {
    return normalized;
  }

  if (normalized.includes("flash")) {
    return "gemini-2.5-flash";
  }

  if (normalized.includes("pro")) {
    return "gemini-2.5-pro";
  }

  return "gemini-2.5-flash";
}

const GEMINI_MODEL = normalizeGeminiModelName(RAW_GEMINI_MODEL);

function buildDiaryContext(entries) {
  if (!entries.length) {
    return "No diary entries are available yet for this user.";
  }

  return entries
    .map((entry, index) => {
      const tagNames = entry.tags?.map((tag) => tag.name).filter(Boolean) || [];
      const tags = tagNames.length ? ` Tags: ${tagNames.join(", ")}.` : "";
      const summary = entry.summary ? ` Summary: ${entry.summary}.` : "";
      return `${index + 1}. ${entry.date.toISOString()}: ${entry.content}${summary}${tags}`;
    })
    .join("\n");
}

async function createChatReply(req, res) {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the backend.",
      });
    }

    const recentEntries = await prisma.dailyDiary.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
      include: { tags: true },
      take: 5,
    });

    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) => item && typeof item.text === "string" && typeof item.isBot === "boolean")
          .slice(-6)
      : [];

    const contents = [
      ...safeHistory.map((item) => ({
        role: item.isBot ? "model" : "user",
        parts: [{ text: item.text }],
      })),
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: [
                "You are Diary Buddy, a warm and supportive wellness journaling assistant inside the Reflectly mobile app.",
                "Keep replies concise, practical, and emotionally supportive.",
                "Do not claim to be a therapist or provide medical diagnosis.",
                "If the user appears in crisis, encourage them to seek immediate support from a trusted person or local emergency resources.",
                "Use the diary context when it is relevant, but do not invent facts that are not present.",
                `Recent diary context:\n${buildDiaryContext(recentEntries)}`,
              ].join("\n\n"),
            },
          ],
        },
        contents,
      }),
    }
    );

    const data = await response.json();

    if (!response.ok) {
      const apiError = data?.error?.message || "Gemini request failed.";
      
      // Check for image input error and return friendly message
      if (apiError.includes("image input") || apiError.includes("does not support image")) {
        return res.status(400).json({ 
          error: "Image support is not available yet. Please send text messages only." 
        });
      }
      
      return res.status(response.status).json({ error: apiError });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({ error: "The chat response was empty." });
    }

    res.json({ reply });
  } catch (error) {
    console.error("CreateChatReply error:", error);
    res.status(500).json({ error: "Failed to generate chat reply." });
  }
}

module.exports = { createChatReply };
