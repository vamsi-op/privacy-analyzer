// Background service worker for Privacy Analyzer
// Listens for messages from content script and popup

const trackerDomains = new Map();
const canvasFingerprints = new Map();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRACKER_DETECTED') {
    const tabId = sender.tab?.id;
    if (tabId) {
      if (!trackerDomains.has(tabId)) {
        trackerDomains.set(tabId, []);
      }
      // Ensure fingerprintingAPIs, canvasDetections and inlineEvalPatterns exist for older messages
      const data = Object.assign({ fingerprintingAPIs: [], inlineEvalPatterns: [], canvasDetections: [] }, message.data);
      trackerDomains.get(tabId).push(data);
    }
  } else if (message.type === 'CANVAS_FINGERPRINT') {
    // Real-time canvas fingerprinting detection
    const tabId = sender.tab?.id;
    if (tabId) {
      if (!canvasFingerprints.has(tabId)) {
        canvasFingerprints.set(tabId, []);
      }
      canvasFingerprints.get(tabId).push(message.data);
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
  canvasFingerprints.delete(tabId);
});

console.log('Privacy Analyzer background worker initialized');
