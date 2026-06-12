<h1>LangLua - learn languages while surfing the web.</h1>

<h2>What is LangLua?</h2>
   LangLua replaces words on webpages with their translations in your chosen language, turning everyday browsing into language learning!

LangLua works as a Chrome extension available on the Chrome Web Store through this link:
https://chromewebstore.google.com/detail/langlua/dnoebbbbgiiffbmicnngiccmmdgadmpj

**Translated words on webpages have the functionalities to:**

- Have Audio Pronunciation using ElevenLabs TTS.
- Guess direct definitions through the Gemini API.
- Provide direct definitions if needed.

<img width="415" height="806" alt="Screenshot 2026-06-12 at 11 21 55 AM" src="https://github.com/user-attachments/assets/57275858-0db4-41f1-8c4f-478f7085102e" />

**Features of this extension include:**
- Word Replacement on website.
- Intensity Control to control the number of words that are replaced on a website.
- Pronunciations of words.
- Streak tracker to watch your progress.
- 4 Languages - Japanese, Spanish, French, and Hindi.

<img width="380" height="400" alt="Screenshot 2026-06-12 at 11 20 50 AM" src="https://github.com/user-attachments/assets/4e124572-188e-40ac-bd91-b4a0dbdeadbb" />
<img width="1512" height="823" alt="Screenshot 2026-06-12 at 11 22 14 AM" src="https://github.com/user-attachments/assets/ff05564e-2a7c-4ebc-b1ba-37d62d82c98c" />


<h2>Setup</h2>

Must have:
- Node.js >= 18
- npm >= 9

**1. Clone the repository**
git clone https://github.com/Fyre-Aspect/LangLUI.git

cd LangLUI

**2. Set up the extension**

cd webapp
npm install
npm run dev

To run the app, open chrome://extensions, turn on developer mode, and open the dist folder of the repository.

The extension must be rebuilt and reloaded in Chrome after any changes.

- To do this, simply run npm run build.

https://github.com/user-attachments/assets/0e6be8b1-598d-4f30-8e2b-bc92dae5605a
