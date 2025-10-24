const { parseFilters, filterResults, analyzeHTML } = require('./index');

describe('CLI parseFilters', () => {
  test('parses comma-separated filters and expands all', () => {
    expect(parseFilters('all')).toEqual(['trackers', 'eval', 'fingerprinting']);
    expect(parseFilters('trackers, eval')).toEqual(['trackers', 'eval']);
  });

  test('throws on invalid filter', () => {
    expect(() => parseFilters('unknown')).toThrow(/Invalid filter type/);
  });
});

describe('CLI filterResults', () => {
  test('filters out selected categories and updates summary', () => {
    const results = {
      thirdPartyDomains: ['a.com', 'b.com'],
      inlineEvalPatterns: [{}, {}],
      fingerprintingAPIs: ['navigator.userAgent'],
      summary: { totalThirdPartyDomains: 2, totalEvalPatterns: 2, totalFingerprintingAPIs: 1 }
    };
    const filtered = filterResults(results, ['trackers']);
    expect(filtered.thirdPartyDomains.length).toBe(2);
    expect(filtered.inlineEvalPatterns.length).toBe(0);
    expect(filtered.fingerprintingAPIs.length).toBe(0);
    expect(filtered.summary.totalThirdPartyDomains).toBe(2);
    expect(filtered.summary.totalEvalPatterns).toBe(0);
    expect(filtered.summary.totalFingerprintingAPIs).toBe(0);
  });
});

describe('CLI analyzeHTML', () => {
  test('detects third-party src and inline eval pattern', () => {
    const html = `
      <html>
        <head>
          <script src="https://cdn.example.net/lib.js"></script>
          <script>eval('alert(1)')</script>
        </head>
      </html>`;
    const res = analyzeHTML(html, 'https://example.com/');
    expect(res.thirdPartyDomains).toContain('cdn.example.net');
    expect(res.summary.totalEvalPatterns).toBeGreaterThanOrEqual(1);
  });
});
