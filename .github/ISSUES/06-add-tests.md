# [GOOD FIRST ISSUE] Add Unit Tests for Core Functionality

## 🎯 Description
The project currently has no automated tests. We need to add unit tests for core detection functions to ensure code quality and prevent regressions.

## ✨ Expected Outcome
A basic test suite that covers:
- Third-party domain detection
- Eval pattern detection
- JSON export formatting
- CLI parsing functions

## 📝 Steps to Complete
1. Choose a testing framework (Jest recommended)
2. Set up test configuration
3. Write tests for detection functions in `content.js`
4. Write tests for CLI in `cli/index.js`
5. Add test scripts to `package.json`
6. Update CI workflow to run tests
7. Document how to run tests in README

## 📂 Files to Create/Modify
- Create `extension/content.test.js`
- Create `cli/index.test.js`
- Modify `package.json` - Add test dependencies and scripts
- Modify `.github/workflows/ci.yml` - Enable test running

## 💡 Helpful Resources
- [Jest Getting Started](https://jestjs.io/docs/getting-started)
- [Testing JavaScript](https://testingjavascript.com/)
- [MDN: Testing](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Introduction)

## ✅ Acceptance Criteria
- [ ] Jest (or similar) is configured
- [ ] At least 5 test cases for detection functions
- [ ] At least 3 test cases for CLI
- [ ] Tests pass locally
- [ ] Tests run in CI
- [ ] Test coverage is reported
- [ ] Documentation updated with test instructions

## 📊 Estimated Difficulty
**Medium** - Requires testing knowledge

## ⏱️ Estimated Time
About 4-5 hours

## 🧪 Example Test Cases
```javascript
describe('Third-party domain detection', () => {
  test('detects Google Analytics', () => {
    // Test implementation
  });
  
  test('ignores same-domain scripts', () => {
    // Test implementation
  });
});
```

## 🎨 Bonus Points
- Set up test coverage reporting
- Add integration tests
- Set up pre-commit hooks to run tests
- Add E2E tests for the extension

## ❓ Questions?
Never written tests before? This is a great learning opportunity! Ask for help getting started.

---
**Labels:** `good first issue`, `help wanted`, `hacktoberfest`, `testing`, `enhancement`
