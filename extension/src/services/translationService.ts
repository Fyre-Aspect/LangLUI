export const translateWords = async (words: string[], targetLanguage: string): Promise<Record<string, string>> => {
  if (words.length === 0) return {};

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `Translate the following English words into ${targetLanguage}. Return ONLY a valid JSON object with no markdown or explanation. Format: { "word": "translation" }. Words: ${JSON.stringify(words)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Translation error", error);
    return {};
  }
};
