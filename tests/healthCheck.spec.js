const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const config = require('../playwright.config');

const visited = new Set();
const failed = new Set();

test('Automated Website Crawler & Health Checker', async ({ page }) => {
  
  // Set up console error listener once
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const logDir = 'logs';
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(
        path.join(logDir, 'console-errors.txt'), 
        `${new Date().toISOString()} - ${page.url()} : ${msg.text()}\n`
      );
    }
  });

  // Set up network response listener for HTTP errors
  page.on('response', response => {
    if (!response.ok()) {
      const logDir = 'logs';
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(
        path.join(logDir, 'http-errors.txt'),
        `${new Date().toISOString()} - ${response.url()} : HTTP ${response.status()}\n`
      );
    }
  });

  const crawlPage = async (url, depth = 0) => {
    // Validate inputs
    if (!url || visited.has(url) || failed.has(url) || depth > config.crawlDepth) {
      return;
    }

    visited.add(url);
    console.log(`Crawling (depth ${depth}):`, url);

    try {
      // Navigate with timeout and wait for network idle
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Check if page loaded successfully
      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status() || 'unknown'}`);
      }

      // Create screenshot with better filename handling
      const screenshotDir = 'screenshots';
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      let fileName = url
        .replace(/^https?:\/\//, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 100); // Limit filename length
      
      await page.screenshot({ 
        path: path.join(screenshotDir, `${fileName}_${Date.now()}.png`), 
        fullPage: true 
      });

      // Find internal links with better filtering
      const links = await page.$$eval('a[href]', (anchors, origin) =>
        anchors
          .map(a => {
            try {
              return new URL(a.href, origin).href;
            } catch {
              return null;
            }
          })
          .filter(href => href && href.startsWith(origin))
          .filter((href, index, arr) => arr.indexOf(href) === index), // Remove duplicates
        page.url().split('/').slice(0, 3).join('/')
      );

      console.log(`Found ${links.length} internal links on ${url}`);

      // Crawl links with controlled concurrency
      const concurrencyLimit = 3;
      for (let i = 0; i < links.length; i += concurrencyLimit) {
        const batch = links.slice(i, i + concurrencyLimit);
        await Promise.allSettled(
          batch.map(link => crawlPage(link, depth + 1))
        );
      }

    } catch (error) {
      failed.add(url);
      console.log('Failed to crawl:', url, error.message);
      
      const logDir = 'logs';
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(
        path.join(logDir, 'crawl-errors.txt'),
        `${new Date().toISOString()} - ${url} : ${error.message}\n`
      );
    }
  };

  // Start crawling
  console.log('Starting crawl from:', config.baseURL);
  await crawlPage(config.baseURL);
  
  // Summary
  console.log('=== Crawl Summary ===');
  console.log('Total Pages Visited:', visited.size);
  console.log('Total Pages Failed:', failed.size);
  console.log('Success Rate:', `${((visited.size - failed.size) / visited.size * 100).toFixed(1)}%`);
  
  // Write summary to file
  const summaryDir = 'logs';
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
  fs.writeFileSync(
    path.join(summaryDir, 'crawl-summary.txt'),
    `Crawl completed at: ${new Date().toISOString()}\n` +
    `Total Pages Visited: ${visited.size}\n` +
    `Total Pages Failed: ${failed.size}\n` +
    `Success Rate: ${((visited.size - failed.size) / visited.size * 100).toFixed(1)}%\n` +
    `\nVisited URLs:\n${Array.from(visited).join('\n')}\n`
  );
});