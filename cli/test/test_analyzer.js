const assert = require('assert');
const { analyzeHTML } = require('../analyzer');

function run() {
  const html = `<!doctype html><html><head><script src="https://cdn.example.com/script.js"></script><script>eval("evil")</script></head><body><canvas></canvas></body></html>`;
  const url = 'https://example.com';
  const result = analyzeHTML(html, url);

  // Basic assertions
  assert.strictEqual(result.summary.totalThirdPartyDomains, 1, 'should detect one third-party domain');
  assert.strictEqual(result.summary.totalEvalPatterns, 1, 'should detect one eval pattern');
  assert.ok(result.summary.totalFingerprintingAPIs >= 1, 'should detect at least one fingerprinting API');

  console.log('All analyzer tests passed.');
}

if (require.main === module) run();
