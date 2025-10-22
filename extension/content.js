// Content script - runs on every page to detect trackers and scripts
// Sends detected items to background script

(function () {
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
      const detections = detectDangerousPatterns(content);

      if (detections.length > 0) {
        evalPatterns.push({
          index,
          patterns: detections
        });
      }
    });

    return evalPatterns;
  }

  /**
   * Enhanced detection for dangerous JavaScript patterns
   * Scans code for eval(), Function constructor, setTimeout/setInterval with strings,
   * and obfuscated eval patterns while avoiding false positives from comments
   * @param {string} code - JavaScript code to analyze
   * @returns {Array<Object>} Array of detected patterns with line numbers and context
   */
  function detectDangerousPatterns(code) {
    const detections = [];

    // Remove comments to avoid false positives
    const codeWithoutComments = removeComments(code);

    // Split into lines for context
    const lines = codeWithoutComments.split('\n');

    // Pattern definitions with descriptions
    const patterns = [
      {
        name: 'eval',
        regex: /\beval\s*\(/g,
        description: 'Direct eval() call'
      },
      {
        name: 'Function constructor',
        regex: /\bnew\s+Function\s*\(/g,
        description: 'Function constructor with string'
      },
      {
        name: 'Function constructor (no new)',
        regex: /(?<![.\w])Function\s*\(/g,
        description: 'Function constructor without new keyword'
      },
      {
        name: 'setTimeout with string',
        regex: /\bsetTimeout\s*\(\s*['"`]/g,
        description: 'setTimeout with string argument'
      },
      {
        name: 'setInterval with string',
        regex: /\bsetInterval\s*\(\s*['"`]/g,
        description: 'setInterval with string argument'
      },
      {
        name: 'Obfuscated eval (bracket notation)',
        regex: /\bwindow\s*\[\s*['"`]eval['"`]\s*\]/g,
        description: 'Obfuscated eval using bracket notation'
      },
      {
        name: 'Obfuscated eval (this)',
        regex: /\bthis\s*\[\s*['"`]eval['"`]\s*\]/g,
        description: 'Obfuscated eval using this'
      }
    ];

    // Check each pattern
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex.source, 'g'); // Ensure global flag for proper iteration
      let match;

      while ((match = regex.exec(codeWithoutComments)) !== null) {
        // Find line number and context
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

  /**
   * Remove single-line and multi-line comments to avoid false positives
   * @param {string} code - JavaScript code
   * @returns {string} Code with comments removed
   */
  function removeComments(code) {
    // Remove multi-line comments /* ... */
    let cleaned = code.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single-line comments // ...
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    return cleaned;
  }

  /**
   * Get line number and context for a given position in code
   * @param {Array<string>} lines - Array of code lines
   * @param {number} position - Character position in the code
   * @returns {Object} Object with lineNumber, column, and snippet
   */
  function getLineContext(lines, position) {
    let currentPos = 0;
    let lineNumber = 1;
    let column = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline

      if (currentPos + lineLength > position) {
        lineNumber = i + 1;
        column = position - currentPos;

        // Get snippet (trim to reasonable length)
        let snippet = lines[i].trim();
        if (snippet.length > 80) {
          snippet = snippet.substring(0, 80) + '...';
        }

        return { lineNumber, column, snippet };
      }

      currentPos += lineLength;
    }

    return { lineNumber: 1, column: 0, snippet: lines[0] ? lines[0].substring(0, 80) : '' };
  }

  // Run detection
  const thirdPartyDomains = detectThirdPartyScripts();
  const inlineEvalPatterns = detectInlineScripts();
  const fingerprintingAPIs = detectFingerprinting();

  // Send results to background script
  chrome.runtime.sendMessage({
    type: 'TRACKER_DETECTED',
    data: {
      url: window.location.href,
      thirdPartyDomains,
      inlineEvalPatterns,
      fingerprintingAPIs,
      timestamp: Date.now()
    }
  });

  console.log('Privacy Analyzer: detected', thirdPartyDomains.length, 'third-party domains');
})();

/**
 * Detect fingerprinting-ish APIs and canvas usage on the page.
 * Returns an array of detected items (strings).
 */
function detectFingerprinting() {
  const detections = new Set();

  // 1) Presence of <canvas> elements is often used for fingerprinting
  try {
    const canvasCount = document.querySelectorAll('canvas').length;
    if (canvasCount > 0) {
      detections.add('canvas.element_present');
    }
  } catch (e) {
    // ignore
  }

  // 2) Scan inline scripts for common canvas / fingerprinting API usage
  const inlineScripts = document.querySelectorAll('script:not([src])');
  const patterns = [
    { id: 'canvas.getContext', re: /\.getContext\s*\(\s*['\"]2d['\"]\s*\)/i },
    { id: 'canvas.toDataURL', re: /\.toDataURL\s*\(/i },
    { id: 'canvas.toBlob', re: /\.toBlob\s*\(/i },
    { id: 'navigator.plugins', re: /navigator\.plugins/i },
    { id: 'navigator.userAgent', re: /navigator\.userAgent/i },
    { id: 'screen.dimensions', re: /screen\.(width|height)/i },
    { id: 'webgl.getParameter', re: /getParameter\s*\(/i }
  ];

  inlineScripts.forEach(script => {
    const code = script.textContent || '';
    patterns.forEach(p => {
      if (p.re.test(code)) {
        detections.add(p.id);
      }
    });
  });

  return Array.from(detections);
}
