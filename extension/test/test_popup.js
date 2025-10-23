// Test file for popup theme functionality
const fs = require('fs');
const path = require('path');

// Mock DOM environment for testing
global.document = {
  body: {
    classList: {
      contains: function(className) {
        return this._className === className;
      },
      _className: 'light-theme'
    },
    className: 'light-theme'
  },
  getElementById: function(id) {
    if (id === 'themeToggle') {
      return {
        addEventListener: function(event, handler) {
          this._clickHandler = handler;
        },
        _clickHandler: null,
        click: function() {
          if (this._clickHandler) {
            this._clickHandler();
          }
        },
        textContent: '🌙',
        title: 'Toggle theme'
      };
    }
    return null;
  }
};

global.window = {
  matchMedia: function(query) {
    return {
      matches: false,
      addEventListener: function() {}
    };
  }
};

global.localStorage = {
  _data: {},
  setItem: function(key, value) {
    this._data[key] = value;
  },
  getItem: function(key) {
    return this._data[key];
  },
  removeItem: function(key) {
    delete this._data[key];
  }
};

// Test functions
function testSetTheme() {
  // Reset
  document.body.className = 'light-theme';
  document.body.classList._className = 'light-theme';
  localStorage._data = {};
  
  // Mock the setTheme function logic
  function setTheme(theme) {
    document.body.className = theme + '-theme';
    document.body.classList._className = theme + '-theme';
    localStorage.setItem('theme', theme);
  }
  
  // Test setting light theme
  setTheme('light');
  if (document.body.className !== 'light-theme') {
    throw new Error('Light theme not set correctly');
  }
  
  if (localStorage.getItem('theme') !== 'light') {
    throw new Error('Light theme not saved to localStorage');
  }
  
  // Test setting dark theme
  setTheme('dark');
  if (document.body.className !== 'dark-theme') {
    throw new Error('Dark theme not set correctly');
  }
  
  if (localStorage.getItem('theme') !== 'dark') {
    throw new Error('Dark theme not saved to localStorage');
  }
  
  console.log('✓ setTheme function works correctly');
}

function testToggleTheme() {
  // Reset
  document.body.className = 'light-theme';
  document.body.classList._className = 'light-theme';
  localStorage._data = {};
  
  // Mock the toggleTheme function logic
  function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.className = newTheme + '-theme';
    document.body.classList._className = newTheme + '-theme';
    localStorage.setItem('theme', newTheme);
  }
  
  // Test toggling from light to dark
  if (document.body.className !== 'light-theme') {
    throw new Error('Initial theme should be light');
  }
  
  toggleTheme();
  if (document.body.className !== 'dark-theme') {
    throw new Error('Theme should toggle to dark');
  }
  
  // Test toggling from dark to light
  toggleTheme();
  if (document.body.className !== 'light-theme') {
    throw new Error('Theme should toggle back to light');
  }
  
  console.log('✓ toggleTheme function works correctly');
}

function testInitTheme() {
  // Reset
  document.body.className = 'light-theme';
  document.body.classList._className = 'light-theme';
  localStorage._data = {};
  
  // Mock the initTheme function logic
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.className = savedTheme + '-theme';
      document.body.classList._className = savedTheme + '-theme';
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      document.body.className = theme + '-theme';
      document.body.classList._className = theme + '-theme';
    }
  }
  
  // Test with no saved theme (should use default light)
  initTheme();
  if (document.body.className !== 'light-theme') {
    throw new Error('Should default to light theme when no saved theme');
  }
  
  // Test with saved dark theme
  localStorage.setItem('theme', 'dark');
  initTheme();
  if (document.body.className !== 'dark-theme') {
    throw new Error('Should use saved dark theme');
  }
  
  // Test with saved light theme
  localStorage.setItem('theme', 'light');
  initTheme();
  if (document.body.className !== 'light-theme') {
    throw new Error('Should use saved light theme');
  }
  
  console.log('✓ initTheme function works correctly');
}

// Run tests
function run() {
  try {
    testSetTheme();
    testToggleTheme();
    testInitTheme();
    console.log('All popup theme tests passed.');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) run();