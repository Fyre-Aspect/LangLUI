LangLua - learn languages while surfing the web.

What is LangLua?
   LangLua replaces words on webpages with their translations in your chosen language, turning everyday browsing into language learning!

LangLua works as a chrome extension availble on the Chrome Web Store through this link:
https://chromewebstore.google.com/detail/langlua/dnoebbbbgiiffbmicnngiccmmdgadmpj

Translated words on webpages have the functionalities to:

- Have Audio Pronounciation using ElevenLabs TTS.
- Guess direct definitions through Gemini API.
- Provide direct definitions if needed.


Features of this extension include:
- Word Replacement on website.
- Intensity Control to control the amount of words that are replaced on a website.
- Pronounciations of words.
- Streak tracker to watch your progress.
- 4 Languages - Japanese, Spanish, French, and Hindi.


Setup:

Must have:
- Node.js >= 18
- npm >= 9

1. Clone the repository
git clone https://github.com/Fyre-Aspect/LangLUI.git

cd LangLUI

2. Set up the extension

cd webapp
npm install
npm run dev

To run the app, open chrome://extensions, turn on developer mode, and open the dist folder of the repository.

The extension must be rebuilt and reloaded in Chrome after any changes.

- To do this, simply run npm run build.

