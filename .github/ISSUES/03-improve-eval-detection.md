# [GOOD FIRST ISSUE] Improve Eval() Pattern Detection Heuristics

## 🎯 Description
The current eval() detection in `content.js` only looks for basic patterns like `eval(` and `Function(`. We need to improve the detection to catch more variations and reduce false positives.

## ✨ Expected Outcome
Enhanced detection that catches:
- `setTimeout` and `setInterval` with string arguments
- `new Function()` constructor
- Obfuscated eval patterns
- More accurate detection with fewer false positives

## 📝 Steps to Complete
1. Review current detection code in `extension/content.js` (around line 35-50)
2. Research common eval() patterns and obfuscation techniques
3. Add detection for additional patterns:
   - `setTimeout(string)` and `setInterval(string)`
   - `new Function('...')`
   - Common obfuscation patterns
4. Add context to results (line numbers, snippets)
5. Test on real websites with known eval usage
6. Document the patterns you detect

## 📂 Files to Modify
- `extension/content.js` - Detection function around line 35-50
- Consider creating a new `extension/detectors.js` module for cleaner code

## 💡 Helpful Resources
- [MDN: eval() and alternatives](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)
- [Common JavaScript obfuscation techniques](https://github.com/javascript-obfuscator/javascript-obfuscator)
- Regular expressions for pattern matching

## ✅ Acceptance Criteria
- [ ] Detects `setTimeout(string)` and `setInterval(string)`
- [ ] Detects `new Function()`
- [ ] Reduces false positives (comments, strings, etc.)
- [ ] Provides context (line numbers, code snippets)
- [ ] Code is well-commented
- [ ] Tested on at least 5 different websites

## 📊 Estimated Difficulty
**Medium** - Requires regex knowledge and testing

## ⏱️ Estimated Time
About 3-4 hours

## 🎨 Bonus Points
- Create a configuration file for detection patterns
- Add severity levels (critical, warning, info)
- Detect other dangerous patterns (document.write, innerHTML)

## ❓ Questions?
This is a great learning opportunity! Ask questions about regex, JavaScript patterns, or security concerns.

---
**Labels:** `good first issue`, `help wanted`, `hacktoberfest`, `security`, `enhancement`
