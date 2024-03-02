const { chromium } = require('playwright');

// cd playwright
// node tests-playwright/DEBUGGER-START.js

// Trying to connect to existing playwright session via Chromium CDP
// https://github.com/microsoft/playwright/issues/11442
async function launchPersistentContext() {
  const persistentContext = await chromium.launchPersistentContext('', {
    // https://stackoverflow.com/questions/74341199/playwright-javascript-maximize-browser
    // https://github.com/microsoft/playwright/issues/1086
    // '--start-maximized', '--start-fullscreen' '--window-size=1280,720'
    args: ['--remote-debugging-port=9222', '--start-maximized'],
    devTools: true,
    headless: false,
    userAgent: 'Persistent content for debugging',
    viewport: null
  });
}

launchPersistentContext().catch(error => {
  console.error('Error launching persistent browser:', error);
});

// Playwright/CodeceptJS doesn't show up in Recorder's export options: https://bugs.chromium.org/p/chromium/issues/detail?id=1351416
// >>  (switch to a different tab in Devtools, close your browser, and reopen then switch back to the Recorder section)
// Codegen not working: https://github.com/microsoft/playwright/issues/16154
// npx playwright codegen --channel chrome https://google.com
// Attaching playwright to existing browser window:
// https://github.com/microsoft/playwright/issues/1985
// https://www.jvt.me/posts/2023/09/30/playwright-use-existing-session/
// https://www.google.com/search?q=how+does+Katalon+or+Mabl+run+using+existing+browser+work%3F&rlz=1C5GCEM_enUS1084US1084&oq=how+does+Katalon+or+Mabl+run+using+existing+browser+work%3F&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigATIHCAIQIRigAdIBCTM1MjYzajBqNKgCALACAA&sourceid=chrome&ie=UTF-8
// When you execute a test case in katalon, it start a driver instance of browser (not actual browser with all plugins & settings) . It is expected to work this way… Now if you want to use same active browser then this can be done only with chrome driver in katalon.
// Debugging: https://youtu.be/rhzrFiKfWwY?t=76
// https://developer.chrome.com/docs/devtools/recorder/reference