const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

async function analyzeStress(summary) {
  if (!summary) return null;

  const prompt = `
Analyze the following diary summary and assign a stress level score from 0 to 100.
0 means completely relaxed/no stress at all. 100 means severe stress, overwhelmed, or burnt out.
Return ONLY a single integer number between 0 and 100 representing the score. Do not include any text or symbols.

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
    
    // Attempt to parse out the number
    const match = result.match(/\d+/);
    if (match) {
      let score = parseInt(match[0], 10);
      if (score < 0) score = 0;
      if (score > 100) score = 100;
      return score;
    }

    return null;
  } catch (error) {
    console.error("Gemini Stress Analysis Error:", error);
    return null; // Fallback on error
  }
}

module.exports = { analyzeStress };
