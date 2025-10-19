# GitHub Repository Checklist

Use this checklist before pushing to GitHub to ensure everything is ready.

## ✅ Essential Files

- [x] `README.md` - Project overview and getting started
- [x] `LICENSE` - MIT License
- [x] `CONTRIBUTING.md` - Contribution guidelines
- [x] `.gitignore` - Ignore node_modules, logs, etc.
- [x] `package.json` - Project metadata and scripts

## ✅ GitHub Configuration

- [x] `.github/ISSUE_TEMPLATE/` - Issue templates
  - [x] `bug_report.md`
  - [x] `feature_request.md`
  - [x] `good_first_issue.md`
- [x] `.github/PULL_REQUEST_TEMPLATE.md` - PR template
- [x] `.github/workflows/` - GitHub Actions
  - [x] `ci.yml` - Continuous integration
  - [x] `hacktoberfest-label.yml` - Auto-label PRs
- [x] `.github/ISSUES/` - Ready-to-use issue descriptions

## ✅ Extension Files

- [x] `extension/manifest.json` - Extension manifest (V3)
- [x] `extension/background.js` - Service worker
- [x] `extension/content.js` - Content script
- [x] `extension/popup.html` - Popup UI
- [x] `extension/popup.js` - Popup logic
- [x] `extension/package.json` - Extension metadata
- [ ] `extension/icons/` - Need actual icon files (currently placeholder)

## ✅ CLI Files

- [x] `cli/index.js` - CLI implementation
- [x] `cli/package.json` - CLI metadata

## 🚀 Before Pushing to GitHub

### 1. Test Locally
```bash
# Install dependencies
npm install
cd cli && npm install && cd ..

# Test CLI
cd cli
node index.js analyze https://example.com

# Load extension in browser
# Chrome: chrome://extensions → Load unpacked → select extension/
```

### 2. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Privacy Analyzer v0.1.0"
```

### 3. Create GitHub Repository
- Go to https://github.com/new
- Name: `privacy-analyzer`
- Description: "Local-first privacy analyzer - browser extension and CLI"
- Public repository
- Don't initialize with README (we have one)

### 4. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/privacy-analyzer.git
git branch -M main
git push -u origin main
```

### 5. Configure Repository Settings

#### Topics/Tags
Add these topics to your repo for discoverability:
- `hacktoberfest`
- `privacy`
- `security`
- `browser-extension`
- `cli`
- `tracker-detection`
- `local-first`
- `javascript`
- `good-first-issue`

#### Enable Issues
- ✅ Issues should be enabled
- Create labels: `good first issue`, `help wanted`, `hacktoberfest`, `bug`, `enhancement`

#### Create Initial Issues
Copy content from `.github/ISSUES/*.md` files to create actual GitHub issues

#### Branch Protection (Optional but recommended)
- Require PR reviews before merging to main
- Require status checks to pass (CI)

### 6. Create First Release
- Go to Releases → "Create a new release"
- Tag: `v0.1.0`
- Title: "Privacy Analyzer v0.1.0 - Initial Release"
- Description: Initial release with browser extension and CLI

## 📋 Post-GitHub Setup

### Create Issues
1. Go to Issues → New Issue
2. Use content from `.github/ISSUES/` directory
3. Create 5-10 good first issues
4. Add appropriate labels

### Promote Your Project
- [ ] Share on social media
- [ ] Post in Hacktoberfest communities
- [ ] Add to awesome lists (awesome-privacy, awesome-browser-extensions)
- [ ] Submit to product directories

### Maintain
- [ ] Respond to issues and PRs promptly
- [ ] Welcome new contributors
- [ ] Review and merge quality contributions
- [ ] Keep documentation updated

## 🎯 Quick Commands

```bash
# Test extension loads without errors
# Open Chrome DevTools (F12) after loading extension
# Check for console errors

# Test CLI
cd cli
node index.js analyze https://github.com
node index.js analyze https://news.ycombinator.com --output report.json

# Validate JSON files
npm install -g jsonlint
jsonlint extension/manifest.json
jsonlint package.json

# Check for common issues
npm audit
```

## ✨ Ready for GitHub!

Once all checks pass, your repository is ready for contributors!
