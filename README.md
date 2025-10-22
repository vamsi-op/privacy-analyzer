# 🔒 Privacy Analyzer

A **local-first** privacy analyzer that detects trackers, third-party scripts, and fingerprinting on websites — without sending any data to remote servers.

## Features

✅ **Browser Extension** (Chrome/Edge/Firefox compatible)
- Detect third-party domains loading scripts
- Identify inline `eval()` patterns
- Detect canvas fingerprinting attempts (toDataURL / getImageData)
- Export detailed JSON reports
- All analysis happens locally in your browser

✅ **CLI Tool**
- Analyze any URL from the command line
- Detect trackers, eval patterns, and fingerprinting APIs
- Export reports to JSON
- Perfect for automated audits

## Why Local-First?

All analysis happens on your device. No data is sent to remote servers, ensuring complete privacy while analyzing privacy! 🔐

---

## 🚀 Quick Start

### Browser Extension

1. **Load the extension:**
   - Open Chrome/Edge and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Use it:**
   - Visit any website
   - Click the Privacy Analyzer icon
   - View detected trackers and export reports

### CLI Tool

1. **Install dependencies:**
   ```bash
   cd cli
   npm install
   ```

2. **Run analysis:**
   ```bash
   # Analyze all privacy issues
   node index.js analyze https://example.com

   # Filter specific types of issues
   node index.js analyze https://example.com --filter trackers
   node index.js analyze https://example.com --filter eval,fingerprinting
   ```

3. **Export report:**
   ```bash
   # Export all results
   node index.js analyze https://example.com --output report.json

   # Export filtered results
   node index.js analyze https://example.com --filter trackers --output trackers.json
   ```

4. **Available filters:**
   - `trackers`: Show only third-party domains
   - `eval`: Show only inline eval patterns
   - `fingerprinting`: Show only fingerprinting APIs
   - `all`: Show everything (default)
   - Use comma-separated values for multiple filters

---

## 📂 Project Structure

```
privacy-analyzer/
├── extension/          # Browser extension
│   ├── manifest.json   # Extension manifest (Manifest V3)
│   ├── background.js   # Background service worker
│   ├── content.js      # Content script (runs on pages)
│   ├── popup.html      # Extension popup UI
│   ├── popup.js        # Popup logic
│   └── icons/          # Extension icons
├── cli/                # Command-line tool
│   ├── index.js        # CLI implementation
│   └── package.json
├── .github/
│   └── ISSUE_TEMPLATE/ # Issue templates
├── README.md
└── CONTRIBUTING.md
```

---

## 🤝 Contributing

We welcome contributions! This project is perfect for **Hacktoberfest** and first-time contributors.

### Good First Issues

Check out issues labeled [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to get started:

1. **Add UI to show top 3 detected third-party domains** 
2. **Add JSON export functionality**
3. **Improve eval() detection heuristics**
4. **Add more fingerprinting API detection**
5. **Create extension icons**
6. **Add unit tests**

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🛠️ Tech Stack

- **Extension:** JavaScript, WebExtensions API (Manifest V3)
- **CLI:** Node.js, Commander.js
- **Testing:** (Coming soon - add your first test!)

---

## 📋 Roadmap

- [ ] Add more tracker detection rulesets
 - [x] Detect canvas fingerprinting
- [ ] Add WebRTC leak detection
- [ ] Create Firefox-specific manifest
- [ ] Add automated tests
- [ ] Create a website/dashboard for the project
- [ ] Add CI/CD with GitHub Actions

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🌟 Hacktoberfest 2025

This project participates in **Hacktoberfest**! Contribute and earn your swag while learning about privacy and web security.

### How to participate:
1. Fork this repository
2. Pick an issue or suggest a new feature
3. Create a pull request
4. Get your PR reviewed and merged!

---

## 📞 Support

- Create an [issue](../../issues) for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and follow our [Code of Conduct](CODE_OF_CONDUCT.md)

---

Made with ❤️ for privacy and open source
