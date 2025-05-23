import { chromium } from '@playwright/test';

export const launchBrowser = async () => {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222'],
    devtools: false,
    headless: true
  });
  return browser;
};

export const launchPersistentContext = async () => {
  const persistentContext = await chromium.launchPersistentContext('', {
    // https://stackoverflow.com/questions/74341199/playwright-javascript-maximize-browser
    // https://github.com/microsoft/playwright/issues/1086
    // '--start-maximized', '--start-fullscreen' '--window-size=1280,720'
    args: ['--remote-debugging-port=9222', '--window-size=1400,920'],
    devtools: true,
    headless: false,
    userAgent: 'Persistent context for debugging'
  });
  return persistentContext;
}

export const attachToBrowser = async () => {
  // Launch npx @playwright/mcp@latest --port 8931

  const attachedBrowser = await chromium.connectOverCDP('http://localhost:9222');
  const context = attachedBrowser.contexts()[0];

  const page = context.pages()[0];
  return { context, page }
}