const ELEVEN_KEY = "sk_8a7a2a8957bb806497506a635b22f970080797881992ea28";
const VOICE_ID = "pNInz6obpgDQGcFmaJgB";
const ELEVEN_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export const playPronunciation = async (text: string): Promise<void> => {
  try {
    const response = await fetch(ELEVEN_URL, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) throw new Error("TTS failed");
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
    
    await audio.play();
  } catch (error) {
    console.error("Audio error", error);
  }
};
