#!/usr/bin/env node

/**
 * Privacy Analyzer CLI
 * Analyze websites for trackers and privacy issues from the command line
 */

const { program } = require('commander');
const https = require('https');
const http = require('http');
const { analyzeHTML } = require('./analyzer');

program
  .name('privacy-analyzer')
  .description('Local-first privacy analyzer - detect trackers and fingerprinting')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a URL for privacy issues')
  .argument('<url>', 'URL to analyze')
  .option('-o, --output <file>', 'Output JSON report to file')
  .option('-f, --filter <types>', 'Filter results by type (trackers,eval,fingerprinting,all)', 'all')
  .action(async (url, options) => {
    console.log(`🔍 Analyzing: ${url}\n`);

    try {
      const filters = parseFilters(options.filter);
      const html = await fetchPage(url);
  let results = analyzeHTML(html, url);
      results = filterResults(results, filters);
      
      displayResults(results, filters);

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

// Parse and validate filter types
function parseFilters(filterString) {
  const validFilters = ['trackers', 'eval', 'fingerprinting', 'all'];
  const filters = filterString.split(',').map(f => f.trim().toLowerCase());
  
  // Validate filters
  const invalid = filters.filter(f => !validFilters.includes(f));
  if (invalid.length > 0) {
    throw new Error(`Invalid filter type(s): ${invalid.join(', ')}\nValid types: ${validFilters.join(', ')}`);
  }
  
  return filters.includes('all') ? validFilters.slice(0, -1) : filters;
}

// Filter results based on user selection
function filterResults(results, filters) {
  const filtered = { ...results };
  
  if (!filters.includes('trackers')) {
    filtered.thirdPartyDomains = [];
  }
  if (!filters.includes('eval')) {
    filtered.inlineEvalPatterns = [];
  }
  if (!filters.includes('fingerprinting')) {
    filtered.fingerprintingAPIs = [];
  }
  
  // Update summary counts
  filtered.summary = {
    totalThirdPartyDomains: filtered.thirdPartyDomains.length,
    totalEvalPatterns: filtered.inlineEvalPatterns.length,
    totalFingerprintingAPIs: filtered.fingerprintingAPIs.length
  };
  
  return filtered;
}

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
function displayResults(results, filters = ['trackers', 'eval', 'fingerprinting']) {
  console.log('📊 Analysis Results');
  console.log('='.repeat(50));
  console.log(`\n🔍 Active Filters: ${filters.join(', ')}`);
  
  if (filters.includes('trackers')) {
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
  }

  if (filters.includes('eval')) {
    console.log(`\n⚠  Inline Eval Patterns (${results.summary.totalEvalPatterns}):`);
    if (results.inlineEvalPatterns.length === 0) {
      console.log('  ✓ None detected');
    } else {
      results.inlineEvalPatterns.forEach(pattern => {
        console.log(`  - Script #${pattern.index}: ${pattern.snippet}`);
      });
    }
  }

  if (filters.includes('fingerprinting')) {
    console.log(`\n👁  Fingerprinting APIs (${results.summary.totalFingerprintingAPIs}):`);
    if (results.fingerprintingAPIs.length === 0) {
      console.log('  ✓ None detected');
    } else {
      results.fingerprintingAPIs.forEach(api => {
        console.log(`  - ${api}`);
      });
    }
  }

  console.log('\n' + '='.repeat(50));
}
