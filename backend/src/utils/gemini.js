const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

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

module.exports = { generateAISummary, analyzeMoodScore, analyzeEmotionalCloud };