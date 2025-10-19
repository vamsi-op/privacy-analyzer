// Content script - runs on every page to detect trackers and scripts
// Sends detected items to background script

(function() {
  'use strict';

  // Simple heuristic: detect third-party domains from script tags
  function detectThirdPartyScripts() {
    const currentDomain = window.location.hostname;
    const scripts = document.querySelectorAll('script[src]');
    const thirdPartyDomains = new Set();

    scripts.forEach(script => {
      try {
        const url = new URL(script.src);
        const scriptDomain = url.hostname;
        
        // Check if it's a third-party domain
        if (scriptDomain && scriptDomain !== currentDomain && !currentDomain.endsWith(scriptDomain)) {
          thirdPartyDomains.add(scriptDomain);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    return Array.from(thirdPartyDomains);
  }

  // Detect inline scripts (potential eval patterns)
  function detectInlineScripts() {
    const inlineScripts = document.querySelectorAll('script:not([src])');
    const evalPatterns = [];

    inlineScripts.forEach((script, index) => {
      const content = script.textContent;
      // Simple heuristic: look for eval( patterns
      if (content.includes('eval(') || content.includes('Function(')) {
        evalPatterns.push({
          index,
          snippet: content.substring(0, 100) + '...'
        });
      }
    });

    return evalPatterns;
  }

  // Run detection
  const thirdPartyDomains = detectThirdPartyScripts();
  const inlineEvalPatterns = detectInlineScripts();

  // Send results to background script
  chrome.runtime.sendMessage({
    type: 'TRACKER_DETECTED',
    data: {
      url: window.location.href,
      thirdPartyDomains,
      inlineEvalPatterns,
      timestamp: Date.now()
    }
  });

  console.log('Privacy Analyzer: detected', thirdPartyDomains.length, 'third-party domains');
})();
