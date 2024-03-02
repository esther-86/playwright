import { test, expect, chromium } from '@playwright/test';
import My from '../Flows/My';

// Randomly can't see the play button for the test anymore: https://github.com/microsoft/playwright/issues/23356#issuecomment-1869112159
// Close, reopen, refresh tests
test('Attach to persistent browser and run code', async ({ page: unused }) => {
  const attachedBrowser = await chromium.connectOverCDP('http://localhost:9222');
  const context = attachedBrowser.contexts()[0];
  // Only expect one main working tab when starting out... 
  // Need to wait for ENTER on navigation anyways
  const page = context.pages()[0];
  let sawPage = page;
  let pawPage = page;

  // Start debugging script here

  await page.locator('xpath=//div[@id="main"]//div//a').first().click()
});

test('On going code', async ({ page: unused }) => {
  const attachedBrowser = await chromium.connectOverCDP('http://localhost:9222');
  const context = attachedBrowser.contexts()[0];
  // Only expect one main working tab when starting out... 
  // Need to wait for ENTER on navigation anyways
  const page = context.pages()[0];

  // Start debugging script here
  await page.goto("https://www.google.com/");
  await My.CommonFlows.search(page, process.env.SEARCH_WORD)
});