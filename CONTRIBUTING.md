# Contributing to Privacy Analyzer

Thank you for your interest in contributing! 🎉

This guide will help you get started with contributing to the Privacy Analyzer project.

---

## 🌟 How Can I Contribute?

### 1. Report Bugs
- Check if the bug has already been reported in [Issues](../../issues)
- If not, create a new issue using the bug report template
- Include clear steps to reproduce, expected behavior, and actual behavior

### 2. Suggest Features
- Check existing issues and discussions
- Create a new issue using the feature request template
- Explain the use case and benefit to users

### 3. Contribute Code
- Pick an existing issue (especially those labeled `good first issue`)
- Comment on the issue to let others know you're working on it
- Fork the repo, create a branch, and submit a PR

### 4. Improve Documentation
- Fix typos, clarify instructions, add examples
- Documentation improvements are always welcome!

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- A modern browser (Chrome, Edge, or Firefox)
- Git

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/privacy-analyzer.git
   cd privacy-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd cli && npm install
   ```

3. **Load the extension in your browser:**
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

4. **Test the CLI:**
   ```bash
   cd cli
   node index.js analyze https://example.com
   ```

---

## 📝 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Use clear branch names:
- `feature/add-canvas-detection`
- `fix/popup-crash`
- `docs/update-readme`

### 2. Make Your Changes
- Write clear, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 3. Test Your Changes

**For the extension:**
- Load your changes by clicking "Reload" in `chrome://extensions/`
- Test on multiple websites
- Check the browser console for errors

**For the CLI:**
- Run the CLI with various URLs
- Test edge cases (invalid URLs, slow sites, etc.)

### 4. Commit Your Changes
Write clear commit messages:
```bash
git commit -m "Add canvas fingerprinting detection"
git commit -m "Fix popup crash when no trackers detected"
git commit -m "Update README with installation steps"
```

### 5. Push and Create a Pull Request
```bash
git push origin your-branch-name
```

Then create a PR on GitHub with:
- A clear title
- Description of what you changed and why
- Reference to related issues (e.g., "Fixes #123")
- Screenshots (if UI changes)

---

## ✅ Pull Request Checklist

Before submitting a PR, make sure:
- [ ] Code follows the existing style
- [ ] Changes are tested and working
- [ ] Commit messages are clear
- [ ] PR description explains the changes
- [ ] Related issue is referenced
- [ ] No unnecessary files are included (node_modules, .DS_Store, etc.)

---

## 🎯 Good First Issues

New to open source? Look for issues labeled:
- `good first issue` - Perfect for beginners
- `help wanted` - We need your help!
- `documentation` - Improve docs

### Example First Contributions:
1. **Add extension icons** - Design simple icons for the extension
2. **Improve detection rules** - Add more tracker domains to detect
3. **Add tests** - Write your first unit test
4. **Fix typos** - Improve documentation
5. **Add examples** - Create sample reports or demos

---

## 🧪 Testing Guidelines

### Manual Testing
- Test the extension on various websites (news, social media, e-commerce)
- Test the CLI with different URL formats
- Check edge cases (no trackers, many trackers, errors)

### Automated Testing (Coming Soon)
We're looking for contributors to help set up:
- Unit tests for detection logic
- Integration tests for the CLI
- Browser automation tests for the extension

**Want to add tests? That's a great first contribution!**

---

## 📐 Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions small and focused
- Use ES6+ features (const/let, arrow functions, etc.)
- 2-space indentation

Example:
```javascript
// Good
function detectThirdPartyDomains(currentDomain, scripts) {
  const thirdPartyDomains = new Set();
  
  scripts.forEach(script => {
    const scriptDomain = extractDomain(script.src);
    if (scriptDomain && scriptDomain !== currentDomain) {
      thirdPartyDomains.add(scriptDomain);
    }
  });
  
  return Array.from(thirdPartyDomains);
}

// Avoid
function d(c,s){let t=new Set();s.forEach(x=>{let d=e(x.src);if(d&&d!==c)t.add(d)});return Array.from(t)}
```

---

## 🚫 What NOT to Do

- Don't include `node_modules/` in your PR
- Don't change unrelated files
- Don't force-push to your PR branch after review has started
- Don't copy code without attribution
- Don't submit AI-generated code without understanding and testing it

---

## 💬 Communication

- **Questions?** Ask in the issue comments or create a discussion
- **Stuck?** Don't hesitate to ask for help!
- **Ideas?** Share them in discussions or create a feature request

---

## 🏆 Recognition

All contributors will be:
- Listed in our contributors section
- Mentioned in release notes for significant contributions
- Eligible for Hacktoberfest swag (if participating)

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, inclusive, and welcoming to all contributors.

---

## 🎉 Thank You!

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making Privacy Analyzer better!

Happy coding! 🚀
