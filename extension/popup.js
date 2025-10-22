// Popup script - displays analysis results
(async function() {
  'use strict';

  const trackerList = document.getElementById('trackerList');
  const evalCount = document.getElementById('evalCount');
  const fingerprintList = document.getElementById('fingerprintList');
  const exportBtn = document.getElementById('exportBtn');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Request tracker data from background script
  chrome.runtime.sendMessage(
    { type: 'GET_TRACKERS', tabId: tab.id },
    (response) => {
      const trackers = response.trackers || [];
      
      if (trackers.length === 0) {
        trackerList.innerHTML = '<li class="tracker-item no-trackers">No trackers detected yet. Refresh the page to analyze.</li>';
        evalCount.textContent = 'No data';
        return;
      }

      // Get the most recent analysis
      const latestData = trackers[trackers.length - 1];
  const domains = latestData.thirdPartyDomains || [];
  const evalPatterns = latestData.inlineEvalPatterns || [];
  const fingerprinting = latestData.fingerprintingAPIs || [];

      // Display top 3 third-party domains
      if (domains.length === 0) {
        trackerList.innerHTML = '<li class="tracker-item no-trackers">✓ No third-party domains detected</li>';
      } else {
        const top3 = domains.slice(0, 3);
        trackerList.innerHTML = top3
          .map(domain => `<li class="tracker-item">📡 ${domain}</li>`)
          .join('');
        
        if (domains.length > 3) {
          trackerList.innerHTML += `<li class="tracker-item" style="font-style: italic;">... and ${domains.length - 3} more</li>`;
        }
      }

      // Display eval pattern count
      if (evalPatterns.length === 0) {
        evalCount.innerHTML = '<span class="no-trackers">✓ No inline eval patterns detected</span>';
      } else {
        evalCount.innerHTML = `<span style="color: #FF9800; font-weight: 500;">⚠ ${evalPatterns.length} inline eval pattern(s) detected</span>`;
      }

      // Display fingerprinting detections (simple list)
      if (fingerprinting.length === 0) {
        if (fingerprintList) fingerprintList.innerHTML = '<li class="tracker-item no-trackers">✓ No fingerprinting APIs detected</li>';
      } else {
        if (fingerprintList) {
          fingerprintList.innerHTML = fingerprinting.map(f => `<li class="tracker-item">👁 ${f}</li>`).join('');
        }
      }

      // Export functionality
      exportBtn.addEventListener('click', () => {
        const report = {
          url: latestData.url,
          timestamp: new Date(latestData.timestamp).toISOString(),
          thirdPartyDomains: domains,
          inlineEvalPatterns: evalPatterns,
          fingerprintingAPIs: fingerprinting,
          summary: {
            totalThirdPartyDomains: domains.length,
            totalEvalPatterns: evalPatterns.length,
            totalFingerprintingAPIs: fingerprinting.length
          }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privacy-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  );
})();
