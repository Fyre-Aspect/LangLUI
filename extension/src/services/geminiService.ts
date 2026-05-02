const geminiUrl = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const getDefinition = async (word: string): Promise<string> => {
  const prompt = `Define the English word '${word}' in one or two simple sentences. Be concise. No formatting.`;
  const response = await fetch(geminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
};

export const checkGuess = async (word: string, guess: string): Promise<boolean> => {
  const prompt = `Is '${guess}' an acceptable or correct definition of '${word}'? Be lenient — partial understanding counts. Reply with ONLY 'yes' or 'no'.`;
  const response = await fetch(geminiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || "no";
  return text.includes("yes");
};
