const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const INSIGHTS_CACHE_TTL_MS = 10 * 60 * 1000;
const insightsPanelCache = new Map();

function fallbackSummary(content) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  const sentenceMatch = trimmed.match(/^(.+?[.!?])\s/);
  if (sentenceMatch && sentenceMatch[1].length <= 120) {
    return sentenceMatch[1];
  }
  if (trimmed.length <= 120) return trimmed;
  return trimmed.substring(0, 120) + "...";
}

async function generateAISummary(content) {
  if (!content || !content.trim()) return "";

  console.log(`[Gemini] Starting AI summary generation, content length: ${content.length}`);

  if (!GEMINI_API_KEY) {
    console.warn("[Gemini] GEMINI_API_KEY not set, using fallback summary.");
    return fallbackSummary(content);
  }

  try {
    console.log(`[Gemini] Calling API with model: ${GEMINI_MODEL}`);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Summarize this diary entry in one concise sentence (max 5 words). Return only the summary, nothing else.\n\nDiary entry:\n${content}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error(`[Gemini] API error: ${response.status}`);
      return fallbackSummary(content);
    }

    const data = await response.json();
    console.log(`[Gemini] API response received, parsing summary...`);

    const summary = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!summary) {
      console.warn("[Gemini] No summary in API response, using fallback.");
      return fallbackSummary(content);
    }

    console.log(`[Gemini] Success! Summary: "${summary}"`);
    return summary;
  } catch (error) {
    console.error(`[Gemini] Exception: ${error.message}`);
    return fallbackSummary(content);
  }
}

async function analyzeMoodScore(content) {
  if (!content || !content.trim()) return 50;

  console.log(`[Gemini] Starting AI mood analysis, content length: ${content.length}`);

  if (!GEMINI_API_KEY) {
    console.warn("[Gemini] GEMINI_API_KEY not set, defaulting to 50.");
    return 50;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Analyze the sentiment of this diary entry and provide a mood score from 0 to 100 (0 = extremely negative/stressed/sad, 100 = extremely positive/happy/peaceful, 50 = neutral). Return only the number, nothing else.\n\nDiary entry:\n${content}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error(`[Gemini] API error: ${response.status}`);
      return 50;
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    const score = parseInt(result, 10);
    if (!isNaN(score)) {
      console.log(`[Gemini] Success! Mood Score: ${score}`);
      return Math.min(100, Math.max(0, score));
    }

    console.warn("[Gemini] Invalid score in API response, defaulting to 50.");
    return 50;
  } catch (error) {
    console.error(`[Gemini] Exception: ${error.message}`);
    return 50;
  }
}

async function analyzeEmotionalCloud(entriesText) {
  if (!entriesText || !entriesText.trim()) {
    return { words: [], aiInsight: "No entries found for this period." };
  }

  console.log(`[Gemini] Starting Emotional Word Cloud analysis, text length: ${entriesText.length}`);

  if (!GEMINI_API_KEY) {
    console.warn("[Gemini] GEMINI_API_KEY not set, returning empty analysis.");
    return { words: [], aiInsight: "AI analysis is currently unavailable." };
  }

  // 💡 මෙන්න විසඳුම! ඔයාගේ අනිත් Functions වලට වැඩ කරන Model එකම (GEMINI_MODEL) මෙතනටත් පාවිච්චි කරනවා.
  const CLOUD_MODEL = GEMINI_MODEL;

  try {
    const prompt = `
      You are an expert psychological sentiment analyzer. 
      Read the following combined text from a user's monthly diary entries.
      
      Your tasks:
      1. Identify the top 8-12 emotional keywords. (CRITICAL: These MUST be SINGLE WORDS ONLY. Do not use phrases like "Academic Learning", just use "Learning").
      2. Estimate the number of entries (value) each word appeared in.
      3. Categorize the sentiment of each word as strictly "positive", "negative", or "neutral".
      4. Provide a 1-sentence personalized reason (aiReason) why this word was significant.
      5. Provide a VERY SHORT, punchy 1-sentence overall insight (aiInsight) for the whole month. (Maximum 10-15 words).

      DIARY TEXT:
      "${entriesText}"

      CRITICAL INSTRUCTION:
      Respond ONLY with a valid JSON object. Do NOT include any conversational text.
      The JSON must strictly follow this exact schema:
      {
        "aiInsight": "Your short insight here.",
        "words": [
          {
            "text": "SingleWord",
            "value": 5,
            "sentiment": "positive",
            "aiReason": "Your reason here."
          }
        ]
      }
    `;

    // 💡 encodeURIComponent එක දාලා URL එක හැදුවා (අනිත් ඒවගේ වගේම)
    const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(CLOUD_MODEL)}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini] Emotional Cloud API error (${response.status}):\n`, errorText);
      return { words: [], aiInsight: "Failed to connect to AI service." };
    }

    const data = await response.json();
    let resultText = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (resultText.startsWith("```json")) {
      resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (resultText.startsWith("```")) {
      resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(resultText);
    console.log(`[Gemini] Success! Extracted ${parsed?.words?.length || 0} emotional words.`);
    return parsed;
  } catch (error) {
    console.error("[Gemini] Error analyzing emotional cloud:", error.message || error);
    return { words: [], aiInsight: "Error processing AI results." };
  }
}

const INSIGHT_ICONS = new Set([
  "sparkles-outline",
  "pulse-outline",
  "leaf-outline",
  "calendar-outline",
  "moon-outline",
  "sunny-outline",
  "checkmark-done-outline",
  "alert-circle-outline",
  "flame-outline",
  "walk-outline",
  "chatbubble-ellipses-outline",
  "book-outline",
  "bulb-outline",
  "heart-outline",
  "ribbon-outline",
]);

const INSIGHT_COLORS = new Set([
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
]);

function sanitizeIcon(icon, fallback = "sparkles-outline") {
  if (typeof icon !== "string") return fallback;
  return INSIGHT_ICONS.has(icon) ? icon : fallback;
}

function sanitizeColor(color, fallback = "#3B82F6") {
  if (typeof color !== "string") return fallback;
  return INSIGHT_COLORS.has(color.toUpperCase()) ? color.toUpperCase() : fallback;
}

function normalizeFocusKeyword(value, fallback = "journal") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

function buildFallbackInsightsPanel(context = {}) {
  const {
    periodLabel = "the selected period",
    entryCount = 0,
    averageMood = 0,
    averageStress = 0,
    topTopics = [],
    bestDay = null,
    worstDay = null,
    positiveDays = 0,
    negativeDays = 0,
  } = context;

  const primaryTopic = topTopics[0]?.label || "journaling";
  const moodPhrase =
    averageMood >= 65 ? "positive" : averageMood >= 40 ? "mixed" : "heavy";
  const stressPhrase =
    averageStress >= 70 ? "high" : averageStress >= 40 ? "moderate" : "light";

  const bestDayLabel = bestDay?.dayLabel || "your best day";
  const worstDayLabel = worstDay?.dayLabel || "your hardest day";

  return {
    summary: `Your ${periodLabel} felt ${moodPhrase}. ${entryCount} entries show a clear pattern around ${primaryTopic}, with stress staying ${stressPhrase} overall.${bestDay ? ` ${bestDayLabel} looked brighter than the rest.` : ""}`,
    cards: [
      {
        title: bestDay ? `Best: ${bestDayLabel}` : "Steady Progress",
        subtitle: bestDay
          ? `${bestDay.moodScore}/100 on your brightest day, with a calmer tone and useful reflection.`
          : "Your notes show steady momentum, even when the week was busy.",
        icon: "sparkles-outline",
        color: "#10B981",
        focusKeyword: normalizeFocusKeyword(primaryTopic),
      },
      {
        title: worstDay ? `Watch: ${worstDayLabel}` : "Stress Check",
        subtitle: worstDay
          ? `${worstDay.moodScore}/100 on the toughest day. A small reset could help when this pattern returns.`
          : "No strong stress spike stood out, which is a healthy sign.",
        icon: "alert-circle-outline",
        color: "#EF4444",
        focusKeyword: normalizeFocusKeyword("stress"),
      },
    ],
    tips: [
      {
        title: "Keep the streak going",
        subtitle: `You have ${entryCount} entries logged, and consistency will sharpen these insights even more.`,
        icon: "checkmark-done-outline",
      },
      {
        title: "Protect low days",
        subtitle: `When stress rises, try one short reset before the day gets crowded.`,
        icon: "leaf-outline",
      },
    {
      title: `Reflect on ${primaryTopic}`,
      subtitle: `A few more notes about ${primaryTopic.toLowerCase()} could make the pattern easier to understand.`,
      icon: "book-outline",
    },
    ],
  };
}

function normalizeInsightsPanel(parsed, fallback) {
  if (!parsed || typeof parsed !== "object") return fallback;

  const summary = typeof parsed.summary === "string" && parsed.summary.trim()
    ? parsed.summary.trim()
    : fallback.summary;

  const cards = Array.isArray(parsed.cards)
    ? parsed.cards.slice(0, 2).map((card, index) => ({
        title:
          typeof card?.title === "string" && card.title.trim()
            ? card.title.trim()
            : fallback.cards[index]?.title || "Insight",
        subtitle:
          typeof card?.subtitle === "string" && card.subtitle.trim()
            ? card.subtitle.trim()
            : fallback.cards[index]?.subtitle || "",
        icon: sanitizeIcon(card?.icon, fallback.cards[index]?.icon || "sparkles-outline"),
        color: sanitizeColor(card?.color, fallback.cards[index]?.color || "#3B82F6"),
        focusKeyword: normalizeFocusKeyword(
          typeof card?.focusKeyword === "string" ? card.focusKeyword : fallback.cards[index]?.focusKeyword,
          fallback.cards[index]?.focusKeyword || "journal"
        ),
      }))
    : fallback.cards;

  const tips = Array.isArray(parsed.tips)
    ? parsed.tips.slice(0, 3).map((tip, index) => ({
        title:
          typeof tip?.title === "string" && tip.title.trim()
            ? tip.title.trim()
            : fallback.tips[index]?.title || "Tip",
        subtitle:
          typeof tip?.subtitle === "string" && tip.subtitle.trim()
            ? tip.subtitle.trim()
            : fallback.tips[index]?.subtitle || "",
        icon: sanitizeIcon(tip?.icon, fallback.tips[index]?.icon || "bulb-outline"),
      }))
    : fallback.tips;

  return { summary, cards, tips };
}

async function generateAIInsightsPanel(context = {}) {
  const fallback = buildFallbackInsightsPanel(context);

  if (!GEMINI_API_KEY) {
    console.warn("[Gemini] GEMINI_API_KEY not set, using fallback insights panel.");
    return fallback;
  }

  try {
    const prompt = `
You are generating a personal diary insights panel from structured data.

Use only the facts in the JSON context below. Do not invent events.
Return only valid JSON with this exact schema:
{
  "summary": "2-3 concise sentences that reflect the user's mood, stress, and main themes.",
  "cards": [
    {
      "title": "2-4 words",
      "subtitle": "1 sentence, grounded in the data",
      "icon": "one of: sparkles-outline, pulse-outline, leaf-outline, calendar-outline, moon-outline, sunny-outline, checkmark-done-outline, alert-circle-outline, flame-outline, walk-outline, chatbubble-ellipses-outline, book-outline, bulb-outline, heart-outline, ribbon-outline",
      "color": "one of: #10B981, #3B82F6, #F59E0B, #EF4444, #8B5CF6, #14B8A6"
    },
    {
      "title": "2-4 words",
      "subtitle": "1 sentence, grounded in the data",
      "icon": "one of the allowed icons",
      "color": "one of the allowed colors"
    }
  ],
  "tips": [
    {
      "title": "2-4 words",
      "subtitle": "1 sentence, practical and supportive",
      "icon": "one of the allowed icons"
    },
    {
      "title": "2-4 words",
      "subtitle": "1 sentence, practical and supportive",
      "icon": "one of the allowed icons"
    },
    {
      "title": "2-4 words",
      "subtitle": "1 sentence, practical and supportive",
      "icon": "one of the allowed icons"
    }
  ]
}

Context JSON:
${JSON.stringify(context, null, 2)}
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`[Gemini] Insights API error: ${response.status}`);
      return fallback;
    }

    const data = await response.json();
    let resultText = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!resultText) {
      return fallback;
    }

    if (resultText.startsWith("```json")) {
      resultText = resultText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (resultText.startsWith("```")) {
      resultText = resultText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(resultText);
    return normalizeInsightsPanel(parsed, fallback);
  } catch (error) {
    console.error("[Gemini] Error generating insights panel:", error.message || error);
    return fallback;
  }
}

function getCachedInsightsPanel(cacheKey) {
  if (!cacheKey) return null;
  const cached = insightsPanelCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > INSIGHTS_CACHE_TTL_MS) {
    insightsPanelCache.delete(cacheKey);
    return null;
  }
  return cached.value;
}

function setCachedInsightsPanel(cacheKey, value) {
  if (!cacheKey) return;
  insightsPanelCache.set(cacheKey, {
    createdAt: Date.now(),
    value,
  });
}

function invalidateInsightsPanelCache(cachePrefix) {
  if (!cachePrefix) return;
  for (const key of insightsPanelCache.keys()) {
    if (key.startsWith(cachePrefix)) {
      insightsPanelCache.delete(key);
    }
  }
}

module.exports = {
  generateAISummary,
  analyzeMoodScore,
  analyzeEmotionalCloud,
  generateAIInsightsPanel,
  getCachedInsightsPanel,
  setCachedInsightsPanel,
  invalidateInsightsPanelCache,
};
