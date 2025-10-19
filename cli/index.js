#!/usr/bin/env node

/**
 * Privacy Analyzer CLI
 * Analyze websites for trackers and privacy issues from the command line
 */

const { program } = require('commander');
const https = require('https');
const http = require('http');

program
  .name('privacy-analyzer')
  .description('Local-first privacy analyzer - detect trackers and fingerprinting')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a URL for privacy issues')
  .argument('<url>', 'URL to analyze')
  .option('-o, --output <file>', 'Output JSON report to file')
  .action(async (url, options) => {
    console.log(`🔍 Analyzing: ${url}\n`);

    try {
      const html = await fetchPage(url);
      const results = analyzeHTML(html, url);
      
      displayResults(results);

      if (options.output) {
        const fs = require('fs');
        fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
        console.log(`\n✓ Report saved to: ${options.output}`);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();

// Fetch HTML content
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => resolve(html));
    }).on('error', reject);
  });
}

// Analyze HTML for privacy issues
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
      // Invalid URL, skip
    }
  }

  // Detect inline scripts with eval patterns
  const inlineScriptRegex = /<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi;
  const evalPatterns = [];
  let inlineMatch;
  let scriptIndex = 0;

  while ((inlineMatch = inlineScriptRegex.exec(html)) !== null) {
    const content = inlineMatch[2];
    if (content.includes('eval(') || content.includes('Function(')) {
      evalPatterns.push({
        index: scriptIndex,
        snippet: content.substring(0, 100).trim() + '...'
      });
    }
    scriptIndex++;
  }

  // Detect potential fingerprinting APIs
  const fingerprintingAPIs = [
    'canvas.toDataURL',
    'navigator.plugins',
    'navigator.userAgent',
    'screen.width',
    'screen.height'
  ];

  const detectedAPIs = fingerprintingAPIs.filter(api => html.includes(api));

  return {
    url,
    timestamp: new Date().toISOString(),
    thirdPartyDomains: Array.from(thirdPartyDomains),
    inlineEvalPatterns: evalPatterns,
    fingerprintingAPIs: detectedAPIs,
    summary: {
      totalThirdPartyDomains: thirdPartyDomains.size,
      totalEvalPatterns: evalPatterns.length,
      totalFingerprintingAPIs: detectedAPIs.length
    }
  };
}

// Display results in terminal
function displayResults(results) {
  console.log('📊 Analysis Results');
  console.log('='.repeat(50));
  
  console.log(`\n📡 Third-Party Domains (${results.summary.totalThirdPartyDomains}):`);
  if (results.thirdPartyDomains.length === 0) {
    console.log('  ✓ None detected');
  } else {
    results.thirdPartyDomains.slice(0, 10).forEach(domain => {
      console.log(`  - ${domain}`);
    });
    if (results.thirdPartyDomains.length > 10) {
      console.log(`  ... and ${results.thirdPartyDomains.length - 10} more`);
    }
  }

  console.log(`\n⚠  Inline Eval Patterns (${results.summary.totalEvalPatterns}):`);
  if (results.inlineEvalPatterns.length === 0) {
    console.log('  ✓ None detected');
  } else {
    results.inlineEvalPatterns.forEach(pattern => {
      console.log(`  - Script #${pattern.index}: ${pattern.snippet}`);
    });
  }

  console.log(`\n👁  Fingerprinting APIs (${results.summary.totalFingerprintingAPIs}):`);
  if (results.fingerprintingAPIs.length === 0) {
    console.log('  ✓ None detected');
  } else {
    results.fingerprintingAPIs.forEach(api => {
      console.log(`  - ${api}`);
    });
  }

  console.log('\n' + '='.repeat(50));
}
