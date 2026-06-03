import { chromium } from 'playwright';
import { normalizeCaptureScreens } from '../../utils/helpers.js';

/**
 * Browser Queue Mechanism to restrict concurrency.
 * Ensures we don't launch more than `concurrencyLimit` browsers simultaneously.
 */
class BrowserQueue {
  constructor(concurrencyLimit) {
    this.concurrencyLimit = concurrencyLimit;
    this.activeTasks = 0;
    this.queue = [];
  }

  enqueue(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeTasks >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    this.activeTasks++;
    const { taskFn, resolve, reject } = this.queue.shift();

    try {
      const result = await taskFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeTasks--;
      this.processQueue();
    }
  }
}

// Limit concurrency to 2 instances to fit within a 1GB RAM VPS footprint
const browserQueue = new BrowserQueue(2);

/**
 * Captures screenshots at required mobile and desktop viewports.
 * Uses browser context for memory safety.
 */
async function captureScreenshots(htmlContent, captureScreens) {
  let browser;
  let context;
  try {
    console.log('Launching Playwright...');
    browser = await chromium.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Helps with limited shared memory on VPS
        '--disable-gpu'
      ]
    });
    
    // Create an isolated context. Offline mode restricts external fetches.
    context = await browser.newContext({
      offline: true, // Blocks external requests to minimize vulnerabilities
    });

    const page = await context.newPage();
    
    // Strict execution timeout (5000ms) to prevent infinite loops (e.g. while(true))
    // We use waitUntil: 'load' since 'networkidle' might not fire predictably in offline mode
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 5000 });

    const views = normalizeCaptureScreens(captureScreens);
    const screenshots = {};

    // Desktop capture (scaled to 800x500 to save base64 token cost)
    if (views.includes('desktop')) {
      await page.setViewportSize({ width: 800, height: 500 });
      const desktopBuffer = await page.screenshot({ type: 'png' });
      screenshots.desktop = desktopBuffer.toString('base64');
    }

    // Mobile capture (scaled to 375x667)
    if (views.includes('mobile')) {
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileBuffer = await page.screenshot({ type: 'png' });
      screenshots.mobile = mobileBuffer.toString('base64');
    }

    return screenshots;
  } catch (error) {
    console.error('Screenshot error:', error);
    if (error.message.includes('Timeout')) {
      throw new Error('Screenshot generation failed: Execution timeout (possible infinite loop detected).');
    }
    throw new Error(`Screenshot generation failed: ${error.message}`);
  } finally {
    // Bulletproof cleanup blocks to prevent zombie Chromium processes
    try {
      if (context) await context.close();
    } catch (err) {
      console.error('Error closing browser context:', err);
    }
    try {
      if (browser) await browser.close();
    } catch (err) {
      console.error('Error closing browser:', err);
    }
  }
}

/**
 * Enqueues a screenshot task to the Browser Queue.
 */
export function enqueueScreenshot(htmlContent, captureScreens) {
  return browserQueue.enqueue(() => captureScreenshots(htmlContent, captureScreens));
}
