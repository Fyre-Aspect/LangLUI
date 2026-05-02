import { getUserPrefs, addCredits } from '../services/firebaseService';

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  if (request.type === "GET_USER_PREFS") {
    getUserPrefs(request.uid).then(prefs => {
      sendResponse(prefs);
    }).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; 
  }
  
  if (request.type === "ADD_CREDITS") {
    addCredits(request.uid, request.amount).catch(console.error);
  }
});
