const { GoogleGenAI } = require("@google/genai");

// Use the API key assigned in the .env file
const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const MOODS = [
  "Happy 😄", "Excited 🤩", "Motivated 🚀", "Proud 😌", "Chill 😎",
  "Relaxed 🧘", "Peaceful 🕊️", "Grateful 🙏", "Focused 🤓", "Neutral 😐",
  "Thoughtful 🤔", "Confused 🫤", "Stressed 😫", "Anxious 😰", "Frustrated 😤",
  "Overwhelmed 😵💫", "Sad 😢", "Tired 🥱", "Burnt out 🪫", "Lonely 😔"
];

async function analyzeMood(summary) {
  if (!summary) return "Neutral 😐";

  const prompt = `
Analyze the following diary summary and select EXACTLY ONE of the moods from the allowed list that best represents the feeling.
Return ONLY the exact string from the list, including the emoji. Do not include any other text, quotes, or markdown.

Allowed moods:
${MOODS.join("\n")}

Diary summary:
"${summary}"
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.2
      }
    });

    let result = response.text.trim();
    
    // Strip quotes if AI added them
    if (result.startsWith('"') && result.endsWith('"')) {
      result = result.slice(1, -1);
    }

    if (MOODS.includes(result)) {
      return result;
    }
    
    // Fallback logic if AI hallucinated slightly
    for (const mood of MOODS) {
      if (result.includes(mood.split(' ')[0])) {
        return mood;
      }
    }

    return "Neutral 😐";
  } catch (error) {
    console.error("Gemini Mood Analysis Error:", error);
    return "Neutral 😐"; // Fallback on error
  }
}

module.exports = { analyzeMood };
