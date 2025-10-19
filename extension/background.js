// Background service worker for Privacy Analyzer
// Listens for messages from content script and popup

const trackerDomains = new Map();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRACKER_DETECTED') {
    const tabId = sender.tab?.id;
    if (tabId) {
      if (!trackerDomains.has(tabId)) {
        trackerDomains.set(tabId, []);
      }
      trackerDomains.get(tabId).push(message.data);
    }
  } else if (message.type === 'GET_TRACKERS') {
    const tabId = message.tabId;
    const trackers = trackerDomains.get(tabId) || [];
    sendResponse({ trackers });
  }
  return true;
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  trackerDomains.delete(tabId);
});

console.log('Privacy Analyzer background worker initialized');
