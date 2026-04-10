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

module.exports = { generateAISummary };
