// Lightweight analyzer extracted from CLI for reuse and testing
const { URL } = require('url');

function analyzeHTML(html, url) {
  const urlObj = new URL(url);
  const currentDomain = urlObj.hostname;

  // Detect third-party script sources
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  const thirdPartyDomains = new Set();
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const scriptUrl = new URL(match[1], url);
      const scriptDomain = scriptUrl.hostname;
      if (scriptDomain && scriptDomain !== currentDomain) {
        thirdPartyDomains.add(scriptDomain);
      }
    } catch (e) {
      // skip
    }
  }

  // Inline eval detection
  const inlineScriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi;
  const evalPatterns = [];
  let inlineMatch;
  let scriptIndex = 0;

  while ((inlineMatch = inlineScriptRegex.exec(html)) !== null) {
    const content = inlineMatch[2];
    if (content.includes('eval(') || content.includes('Function(')) {
      evalPatterns.push({ index: scriptIndex, snippet: content.substring(0, 100).trim() + '...' });
    }
    scriptIndex++;
  }

  // Fingerprinting heuristics
  const fingerprintingAPIs = [];
  if (/canvas/.test(html)) fingerprintingAPIs.push('canvas');
  if (/navigator\.plugins/.test(html)) fingerprintingAPIs.push('navigator.plugins');
  if (/navigator\.userAgent/.test(html)) fingerprintingAPIs.push('navigator.userAgent');

  return {
    url,
    thirdPartyDomains: Array.from(thirdPartyDomains),
    inlineEvalPatterns: evalPatterns,
    fingerprintingAPIs,
    summary: {
      totalThirdPartyDomains: thirdPartyDomains.size,
      totalEvalPatterns: evalPatterns.length,
      totalFingerprintingAPIs: fingerprintingAPIs.length
    }
  };
}

module.exports = { analyzeHTML };
