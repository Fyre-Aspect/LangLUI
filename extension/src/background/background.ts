import { translateWords } from '../services/translationService';
import { fetchAudioDataUri } from '../services/elevenLabsService';
import { getDefinition, checkGuess } from '../services/geminiService';

const DEFAULT_PREFS = { targetLanguage: "ja", intensity: 5 };

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.type === "GET_USER_PREFS") {
    chrome.storage.local.get(["targetLanguage", "intensity"], (result) => {
      const targetLanguage = result.targetLanguage ?? DEFAULT_PREFS.targetLanguage;
      const intensity = result.intensity ?? DEFAULT_PREFS.intensity;
      sendResponse({ targetLanguage, intensity });
    });
    return true;
  }

  if (request.type === "ADD_CREDITS") {
    chrome.storage.local.get(["credits"], (result) => {
      const credits = Number(result.credits ?? 0) + Number(request.amount ?? 0);
      chrome.storage.local.set({ credits });
    });
  }

  if (request.type === "TRANSLATE_WORDS") {
    translateWords(request.words, request.targetLanguage).then(sendResponse);
    return true;
  }

  if (request.type === "FETCH_AUDIO") {
    fetchAudioDataUri(request.text).then(sendResponse);
    return true;
  }

  if (request.type === "GET_DEFINITION") {
    getDefinition(request.word).then(sendResponse);
    return true;
  }

  if (request.type === "CHECK_GUESS") {
    checkGuess(request.word, request.guess).then(sendResponse);
    return true;
  }
});

export {};
