// Export utilities for building reports and filenames (no Chrome APIs)

function pad2(n) { return String(n).padStart(2, '0'); }

function formatFilename(ts) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const HH = pad2(d.getHours());
  const MM = pad2(d.getMinutes());
  return `privacy-report-${yyyy}-${mm}-${dd}-${HH}${MM}.json`;
}

function buildReport(latestData, domains, evalPatterns, manifest = {}, browser = { name: 'Unknown', version: 'Unknown' }, tabUrlFallback) {
  return {
    url: (latestData && latestData.url) || tabUrlFallback || 'Unknown',
    timestamp: latestData && latestData.timestamp ? new Date(latestData.timestamp).toISOString() : new Date().toISOString(),
    thirdPartyDomains: Array.isArray(domains) ? domains : [],
    inlineEvalPatterns: Array.isArray(evalPatterns) ? evalPatterns : [],
    summary: {
      totalThirdPartyDomains: Array.isArray(domains) ? domains.length : 0,
      totalEvalPatterns: Array.isArray(evalPatterns) ? evalPatterns.length : 0
    },
    browser,
    extensionVersion: manifest && manifest.version ? manifest.version : 'Unknown'
  };
}

if (typeof window !== 'undefined') {
  window.ExportUtils = { formatFilename, buildReport };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatFilename, buildReport };
}
