import { test } from '../Fixtures/fixture-medable';
import My from '../Flows/My';

const test_data = [
  { ticket: 'JIRA-123', tcs: 'TE-T1' }
];
for (const current of test_data) {

  test(`Code and Prompt. ${JSON.stringify(current)}`,
    async ({ thisTest, llmPage: page, llmContext: context }) => {

      // Start debugging script here
      await page.goto("https://www.google.com/");
      await My.CommonFlows.search(page, process.env.SEARCH_WORD);

      await page.locator('xpath=//div[@id="main"]//div//a').first().click()

      await My.LLM.runPrompt(page, `Search for LLM Playwright and click on the first result`)
    });
}