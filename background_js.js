// Background Service Worker
// Manages the extension state in the background and handles communication between popup and content scripts

// Set default states when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  // Start in active mode by default
  chrome.storage.local.set({ 
    isActive: true,
    lastElement: null
  });
  
  console.log('HTML Element Analyzer installed. You can activate it using the button in the bottom right corner of the page.');
});

// Handle message communication between content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle extension toggle request from popup
  if (request.action === 'toggleExtension') {
    chrome.storage.local.get('isActive', (data) => {
      const newState = !data.isActive;
      chrome.storage.local.set({ isActive: newState });
      
      // Notify the active tab about the new state
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleActive',
            value: newState
          }).catch(error => console.log('Could not communicate with tab:', error));
        }
      });
      
      sendResponse({ status: 'ok', isActive: newState });
    });
    return true;
  }
  
  // Handle status inquiry from popup
  if (request.action === 'getStatus') {
    chrome.storage.local.get(['isActive', 'lastElement'], (data) => {
      sendResponse({ 
        status: 'ok', 
        isActive: data.isActive,
        lastElement: data.lastElement
      });
    });
    return true;
  }
});
