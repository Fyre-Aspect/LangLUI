import { translateWords, checkGuess, getDefinition } from '../services/translationService';
import { fetchAudioDataUri } from '../services/elevenLabsService';

const DEFAULT_PREFS = { targetLanguage: "ja", intensity: 5 };

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  console.log('[LangLua] Background received message:', request.type);

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
      console.log(`[LangLua] Credits updated: ${credits}`);
    });
  }

  if (request.type === "TRANSLATE_WORDS") {
    console.log(`[LangLua] Translating ${request.words.length} words to ${request.targetLanguage}`);
    translateWords(request.words, request.targetLanguage)
      .then(res => {
        console.log(`[LangLua] Translation complete: ${Object.keys(res).length} results`);
        sendResponse(res);
      })
      .catch(err => {
        console.error('[LangLua] Translation failed:', err);
        sendResponse({});
      });
    return true;
  }

  if (request.type === "FETCH_AUDIO") {
    fetchAudioDataUri(request.text).then(sendResponse);
    return true;
  }

  if (request.type === "GET_DEFINITION") {
    getDefinition(request.word, request.context).then(sendResponse);
    return true;
  }

  if (request.type === "CHECK_GUESS") {
    checkGuess(request.word, request.guess, request.lang, request.expected).then(sendResponse);
    return true;
  }
});

export {};
