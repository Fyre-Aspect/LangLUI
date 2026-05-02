export {};

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
});
