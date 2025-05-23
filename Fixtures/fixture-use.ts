/* eslint-disable no-empty-pattern */
/* eslint-disable lines-around-comment */
import { test as base } from '@playwright/test';
import { attachToBrowser, launchBrowser, launchPersistentContext } from "./fixture-helpers";
import My from "../Flows/My";
// const My = require("./../Flows/My")['default'] // instead of import to see My.Env not undefined, else have to use like My.default.Env

// Save data generated from the test to here so that we can choose which data to use when the time comes
class ThisTest {

  // adminClient
  // locales_en
  // participantEmail
  // current
  // participantPu (queried and saved when loadLocaleForParticipant)
  // locales
  playwright: any;
  data: any = {};
  cleanupFunctions = [];
  toDelete: any = {
    userIds: [],
    participantIds: [],
    schedules: [],
    templates: []
  };

  async configureDataBeforeReturningPage(current) {
    // Load current into data
    for (const key in current) {
      this.data[key] = current[key];
    }
  }

}

// Declare the types of your fixtures.
type MyFixtures = {
  thisTest: ThisTest
  persistentPage: any
  persistentContext: any
  llmPage: any
  llmContext: any
};

// https://playwright.dev/docs/test-fixtures
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyFixtures>({

  // Fixture so that if we want to do clean up, we can... and we should...
  thisTest: async ({ playwright, context }, use) => {
    // Setup
    const thisTest = new ThisTest();
    thisTest.playwright = playwright
    My.TestInfo = thisTest

    // Allow test to use thisTest as an argument
    await use(thisTest);

    let cleanupPromises = []
    await Promise.all(cleanupPromises)
    cleanupPromises = []
  },

  // To use during scripting so that we use a persistent browser and not have to wait for test to run from start
  // This will also avoid a bunch of unnecessary test data generation
  persistentPage: async ({ }, use) => {
    const currentBrowser = await attachToBrowser()
    const persistentPage = currentBrowser.page
    await use(persistentPage)
  },

  persistentContext: async ({ }, use) => {
    const currentBrowser = await attachToBrowser()
    const persistentContext = currentBrowser.context
    await use(persistentContext)
  },

  // To use during scripting so that we use a persistent browser and not have to wait for test to run from start
  // This will also avoid a bunch of unnecessary test data generation
  /*
  llmPage: async ({ }, use) => {
    const context = await launchPersistentContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  */

  llmPage: async ({ }, use) => {
    const browser = await launchBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    await My.LLM.launchMCP();
    await My.LLM.launchTSX();

    await use(page);

    await context.close();
    await browser.close();
  },

  llmContext: async ({ }, use) => {
    const currentBrowser = await attachToBrowser()
    const persistentContext = currentBrowser.context
    await use(persistentContext)
  },

});

export { expect } from '@playwright/test';
export { ThisTest };
