const { isThirdPartyDomain, detectThirdPartyDomainsFromScriptSrcList, detectDangerousPatterns, removeComments } = require('./detection-utils');
const { formatFilename, buildReport } = require('./export-utils');

describe('Third-party domain detection', () => {
  test('detects Google Analytics as third-party', () => {
    const result = isThirdPartyDomain('example.com', 'www.google-analytics.com');
    expect(result).toBe(true);
  });

  test('ignores same-domain scripts', () => {
    const result = isThirdPartyDomain('example.com', 'example.com');
    expect(result).toBe(false);
  });

  test('detects unique third-party domains from script src list', () => {
    const list = [
      'https://cdn.example.com/lib.js',
      'https://www.google-analytics.com/ga.js',
      'https://www.google-analytics.com/analytics.js'
    ];
    const domains = detectThirdPartyDomainsFromScriptSrcList('example.com', list);
    expect(domains).toContain('www.google-analytics.com');
    // In current heuristic, subdomains (cdn.example.com) are treated as third-party
    expect(domains).toContain('cdn.example.com');
  });
});

describe('Eval/dangerous pattern detection', () => {
  test('detects eval()', () => {
    const code = 'const x = 1; eval("alert(1)");';
    const detections = detectDangerousPatterns(code);
    expect(detections.some(d => d.pattern === 'eval')).toBe(true);
  });

  test('ignores commented-out eval', () => {
    const code = `
      // eval('bad()')
      /* new Function('x', 'return x') */
      const y = 2;
    `;
    const cleaned = removeComments(code);
    expect(cleaned.includes('eval(')).toBe(false);
    expect(cleaned.includes('Function(')).toBe(false);
  });
});

describe('JSON export formatting', () => {
  test('filename follows privacy-report-YYYY-MM-DD-HHMM.json', () => {
    const name = formatFilename('2025-10-22T15:45:30.000Z');
    // Allow timezone-independent HHMM by using Date with provided timestamp
    expect(name).toMatch(/^privacy-report-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
  });

  test('buildReport produces expected shape and counts', () => {
    const latestData = { url: 'https://example.com', timestamp: Date.parse('2025-10-22T15:03:44.059Z') };
    const domains = ['a.com', 'b.com'];
    const evalPatterns = [{ pattern: 'eval' }];
    const manifest = { version: '0.1.0' };
    const browser = { name: 'Chrome', version: '141.0.0.0' };
    const report = buildReport(latestData, domains, evalPatterns, manifest, browser);
    expect(report.url).toBe('https://example.com');
    expect(report.summary.totalThirdPartyDomains).toBe(2);
    expect(report.summary.totalEvalPatterns).toBe(1);
    expect(report.extensionVersion).toBe('0.1.0');
    expect(report.browser.name).toBe('Chrome');
  });
});
