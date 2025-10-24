// Popup script - displays analysis results
(async function() {
  'use strict';

  const trackerList = document.getElementById('trackerList');
  const evalCount = document.getElementById('evalCount');
  const exportBtn = document.getElementById('exportBtn');

  // --- Helpers ---

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    // Detect Edge (Chromium) first, then Chrome
    let name = 'Unknown';
    let version = 'Unknown';
    try {
      if (/Edg\//.test(ua)) {
        name = 'Edge';
        version = (ua.match(/Edg\/([0-9\.]+)/) || [])[1] || 'Unknown';
      } else if (/Chrome\//.test(ua)) {
        name = 'Chrome';
        version = (ua.match(/Chrome\/([0-9\.]+)/) || [])[1] || 'Unknown';
      } else if (/Chromium\//.test(ua)) {
        name = 'Chromium';
        version = (ua.match(/Chromium\/([0-9\.]+)/) || [])[1] || 'Unknown';
      }
    } catch (_) {
      // ignore
    }
    return { name, version };
  }

  function showToast(message, type = 'info') {
    const el = document.createElement('div');
    el.textContent = message;
    // Simple inline styles to avoid CSS dependencies
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.bottom = '16px';
    el.style.transform = 'translateX(-50%)';
    el.style.background = type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#323232';
    el.style.color = '#fff';
    el.style.padding = '8px 12px';
    el.style.borderRadius = '4px';
    el.style.fontSize = '12px';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    el.style.zIndex = '9999';
    el.style.opacity = '0';
    el.style.transition = 'opacity 150ms ease-out';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    }, 2200);
  }

  async function downloadBlob(blob, filename) {
    // Prefer chrome.downloads if available (requires "downloads" permission)
    const objectUrl = URL.createObjectURL(blob);
    try {
      if (chrome && chrome.downloads && typeof chrome.downloads.download === 'function') {
        await new Promise((resolve, reject) => {
          chrome.downloads.download({ url: objectUrl, filename, saveAs: false }, (downloadId) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!downloadId) {
              reject(new Error('Download could not be started'));
            } else {
              resolve(downloadId);
            }
          });
        });
      } else {
        // Fallback to anchor tag download (no special permission needed)
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      showToast('Report exported', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Export failed: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Request tracker data from background script
  chrome.runtime.sendMessage(
    { type: 'GET_TRACKERS', tabId: tab.id },
    (response) => {
  const trackers = (response && Array.isArray(response.trackers)) ? response.trackers : [];
      
      if (trackers.length === 0) {
        trackerList.innerHTML = '<li class="tracker-item no-trackers">No trackers detected yet. Refresh the page to analyze.</li>';
        evalCount.textContent = 'No data';
        // Disable export in this case
        if (exportBtn) {
          exportBtn.disabled = true;
          exportBtn.title = 'No analysis data available yet';
        }
        return;
      }

      // Get the most recent analysis
      const latestData = trackers[trackers.length - 1];
      const domains = (latestData && Array.isArray(latestData.thirdPartyDomains)) ? latestData.thirdPartyDomains : [];
      const evalPatterns = (latestData && Array.isArray(latestData.inlineEvalPatterns)) ? latestData.inlineEvalPatterns : [];

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

      // Export functionality
      exportBtn.addEventListener('click', async () => {
        try {
          if (!latestData) {
            throw new Error('No analysis data available');
          }

          const manifest = chrome.runtime.getManifest();
          const browser = getBrowserInfo();

          const report = (window.ExportUtils && window.ExportUtils.buildReport)
            ? window.ExportUtils.buildReport(latestData, domains, evalPatterns, manifest, browser, (tab && tab.url))
            : {
                url: latestData.url || (tab && tab.url) || 'Unknown',
                timestamp: latestData.timestamp ? new Date(latestData.timestamp).toISOString() : new Date().toISOString(),
                thirdPartyDomains: domains,
                inlineEvalPatterns: evalPatterns,
                summary: {
                  totalThirdPartyDomains: domains.length,
                  totalEvalPatterns: evalPatterns.length
                },
                browser,
                extensionVersion: manifest && manifest.version ? manifest.version : 'Unknown'
              };

          const filename = (window.ExportUtils && window.ExportUtils.formatFilename)
            ? window.ExportUtils.formatFilename(latestData.timestamp || Date.now())
            : `privacy-report-${Date.now()}.json`;
          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          await downloadBlob(blob, filename);
        } catch (err) {
          console.error(err);
          showToast('Unable to export: ' + (err && err.message ? err.message : 'Unknown error'), 'error');
        }
      });
    }
  );
})();
