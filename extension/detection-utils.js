// Detection utilities extracted for testing and reuse
// These functions are pure and do not depend on Chrome APIs or the DOM

function isThirdPartyDomain(currentDomain, scriptDomain) {
  try {
    if (!currentDomain || !scriptDomain) return false;
    if (scriptDomain === currentDomain) return false;
    // Avoid treating subdomain relationships as same-site here; keep simple and conservative
    return !currentDomain.endsWith(scriptDomain);
  } catch (_) {
    return false;
  }
}

function detectThirdPartyDomainsFromScriptSrcList(currentDomain, srcList = []) {
  const set = new Set();
  srcList.forEach(src => {
    try {
      const u = new URL(src, 'https://' + currentDomain);
      const domain = u.hostname;
      if (isThirdPartyDomain(currentDomain, domain)) set.add(domain);
    } catch (_) {
      // ignore invalid URLs
    }
  });
  return Array.from(set);
}

function detectDangerousPatterns(code) {
  const detections = [];
  const codeWithoutComments = removeComments(String(code || ''));
  const lines = codeWithoutComments.split('\n');

  const patterns = [
    { name: 'eval', regex: /\beval\s*\(/g, description: 'Direct eval() call' },
    { name: 'Function constructor', regex: /\bnew\s+Function\s*\(/g, description: 'Function constructor with string' },
    { name: 'Function constructor (no new)', regex: /(?<![.\w])Function\s*\(/g, description: 'Function constructor without new keyword' },
    { name: 'setTimeout with string', regex: /\bsetTimeout\s*\(\s*['"`]/g, description: 'setTimeout with string argument' },
    { name: 'setInterval with string', regex: /\bsetInterval\s*\(\s*['"`]/g, description: 'setInterval with string argument' },
    { name: 'Obfuscated eval (bracket notation)', regex: /\bwindow\s*\[\s*['"`]eval['"`]\s*\]/g, description: 'Obfuscated eval using bracket notation' },
    { name: 'Obfuscated eval (this)', regex: /\bthis\s*\[\s*['"`]eval['"`]\s*\]/g, description: 'Obfuscated eval using this' }
  ];

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex.source, 'g');
    let match;
    while ((match = regex.exec(codeWithoutComments)) !== null) {
      const position = match.index;
      const lineInfo = getLineContext(lines, position);
      detections.push({
        pattern: pattern.name,
        description: pattern.description,
        line: lineInfo.lineNumber,
        snippet: lineInfo.snippet,
        column: lineInfo.column
      });
    }
  });

  return detections;
}

function removeComments(code) {
  let cleaned = String(code || '').replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  return cleaned;
}

function getLineContext(lines, position) {
  let currentPos = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    if (currentPos + lineLength > position) {
      const lineNumber = i + 1;
      const column = position - currentPos;
      let snippet = lines[i].trim();
      if (snippet.length > 80) snippet = snippet.substring(0, 80) + '...';
      return { lineNumber, column, snippet };
    }
    currentPos += lineLength;
  }
  return { lineNumber: 1, column: 0, snippet: lines[0] ? lines[0].substring(0, 80) : '' };
}

// Browser global and Node export
if (typeof window !== 'undefined') {
  window.DetectionUtils = { isThirdPartyDomain, detectThirdPartyDomainsFromScriptSrcList, detectDangerousPatterns, removeComments, getLineContext };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isThirdPartyDomain, detectThirdPartyDomainsFromScriptSrcList, detectDangerousPatterns, removeComments, getLineContext };
}
