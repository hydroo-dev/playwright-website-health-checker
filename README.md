# Playwright Website Health Checker

**Description:**  
Playwright Website Health Checker is an automated tool that crawls your website, monitors page health, and captures console and HTTP errors. It takes full-page screenshots of each page, logs errors, and provides a crawl summary, helping developers and QA teams ensure site reliability.

---

## **Features**
- Automated crawling of website starting from `baseURL`.
- Depth-controlled crawling using `crawlDepth`.
- Captures **console errors** and **HTTP response errors**.
- Takes **full-page screenshots** of all visited pages.
- Logs errors and creates a **crawl summary**.
- Handles internal links with **controlled concurrency** for faster crawling.
- Easy to configure via `playwright.config.js`.

---

## **Installation**
1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repo-folder>

Install dependencies:

npm install


Make sure you have Playwright installed:

npx playwright install

Configuration

Update playwright.config.js with:

module.exports = {
  baseURL: 'https://example.com',   // Starting URL
  crawlDepth: 2,                     // Depth limit for crawling
  timeout: 30000                     // Page load timeout
};

Usage

Run the crawler using Playwright test:

npx playwright test tests/health-checker.spec.js

Output

Screenshots: Saved in screenshots/ folder.

Logs: Stored in logs/ folder:

console-errors.txt → JS console errors

http-errors.txt → HTTP status errors

crawl-errors.txt → Errors while crawling pages

crawl-summary.txt → Summary of the crawl, success rate, visited URLs

How It Works

Listens for console errors and network response errors.

Crawls the base URL and follows internal links up to the configured depth.

Captures screenshots of each page.

Logs all errors and creates a detailed summary at the end.

Concurrency control ensures multiple links are crawled efficiently without overloading the site.

Requirements

Node.js >= 16

Playwright

NPM

Contributing

Fork the repository.

Make your changes.

Submit a pull request with improvements or bug fixes.
