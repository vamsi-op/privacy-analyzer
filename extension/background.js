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
      // Ensure fingerprintingAPIs and inlineEvalPatterns exist for older messages
      const data = Object.assign({ fingerprintingAPIs: [], inlineEvalPatterns: [] }, message.data);
      trackerDomains.get(tabId).push(data);
    }
  } else if (message.type === 'CANVAS_FINGERPRINT') {
    // Canvas fingerprinting messages may be sent immediately from content script
    const tabId = sender.tab?.id;
    if (tabId) {
      if (!trackerDomains.has(tabId)) {
        trackerDomains.set(tabId, []);
      }

      // Store canvas detection in a dedicated entry to keep timelines
      const entry = {
        url: message.data.url || sender.tab?.url || null,
        timestamp: message.data.timestamp || Date.now(),
        canvasDetections: [message.data]
      };

      trackerDomains.get(tabId).push(entry);
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
