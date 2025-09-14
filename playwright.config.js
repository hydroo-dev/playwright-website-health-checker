// playwright.config.js
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 120000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  testDir: './tests',
  baseURL: "http://localhost/ecommerce_demo/",
  crawlDepth: 2                     // Max recursion depth
};

module.exports = config;
