import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import path from 'path';

export const launchBrowser = async (cdpPort = 9222): Promise<Browser> => {
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${cdpPort}`],
    devtools: false,
    headless: false
  });
  return browser;
};

export const launchPersistentContext = async (): Promise<BrowserContext> => {
  const userDataDir = path.resolve(__dirname, '../.playwright-profile');
  const persistentContext = await chromium.launchPersistentContext(userDataDir, {
    args: ['--remote-debugging-port=9222', '--window-size=1400,920'],
    devtools: true,
    headless: false,
    userAgent: 'Persistent context for debugging'
  });
  return persistentContext;
};

export const attachToBrowser = async (): Promise<{ context: BrowserContext; page: Page }> => {
  const attachedBrowser = await chromium.connectOverCDP('http://localhost:9222');
  let context = attachedBrowser.contexts()[0];
  if (!context) {
    context = await attachedBrowser.newContext();
  }

  let page = context.pages()[0];
  if (!page) {
    page = await context.newPage();
  }
  return { context, page };
};
