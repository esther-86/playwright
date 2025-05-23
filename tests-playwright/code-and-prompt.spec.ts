import { test } from '../Fixtures/fixture-use';
import My from '../Flows/My';

const test_data = [
  { ticket: 'JIRA-123', tcs: 'TE-T1' }
];
for (const current of test_data) {

  test(`Code and Prompt. ${JSON.stringify(current)}`,
    async ({ thisTest, llmPage: page, llmContext: context }) => {

      test.setTimeout(5 * 60 * 1000);

      // Start debugging script here
      await page.goto("https://www.google.com/");

      await My.LLM.runPrompt(page, `Search for LLM Playwright and click on the first result`)

      const html = await page.content();
      console.log(html);
    });
}