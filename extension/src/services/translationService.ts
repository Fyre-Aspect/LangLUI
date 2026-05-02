const GEMINI_KEY = "AIzaSyC0NDbA1GhusH5YHr2f4L7YhUMK5O94PyU";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

export const translateWords = async (words: string[], targetLanguage: string): Promise<Record<string, string>> => {
  if (words.length === 0) return {};

  const prompt = `Translate the following English words into ${targetLanguage}. Return ONLY a valid JSON object with no markdown or explanation. Format: { "word": "translation" }. Words: ${JSON.stringify(words)}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Strip markdown fences if present
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Translation error", error);
    return {};
  }
};
