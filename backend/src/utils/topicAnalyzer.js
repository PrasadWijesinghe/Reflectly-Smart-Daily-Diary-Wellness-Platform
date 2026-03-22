const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const TOPIC_OPTIONS = [
  "Study Sessions",
  "Exam Prep",
  "Social Time",
  "Self Care",
  "Fitness & Health",
  "Work & Career",
  "Hobbies & Creativity",
  "Family Time",
  "Resting"
];

async function analyzeTopic(summary) {
  if (!summary) return "Resting";

  const prompt = `
Analyze the following diary summary and select EXACTLY ONE of the topics from the allowed list that best categorizes it.
Return ONLY the exact string from the list. Do not include emojis, quotes, or markdown.

Allowed topics:
${TOPIC_OPTIONS.join("\n")}

Diary summary:
"${summary}"
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.1
      }
    });

    let result = response.text.trim();
    if (result.startsWith('"') && result.endsWith('"')) {
      result = result.slice(1, -1);
    }

    if (TOPIC_OPTIONS.includes(result)) {
      return result;
    }

    // Fallback loosely matching part
    for (const t of TOPIC_OPTIONS) {
      if (result.includes(t)) {
        return t;
      }
    }

    return "Resting"; // fallback
  } catch (error) {
    console.error("Gemini Topic Analysis Error:", error);
    return "Resting";
  }
}

module.exports = { analyzeTopic };
