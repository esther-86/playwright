import { test, expect } from '../Fixtures/fixture-use';
import My from '../Flows/My';

const test_data = [
  { ticket: 'JIRA-123', tcs: 'TE-T1' }
];
for (const current of test_data) {

  test(`Code and Prompt. ${JSON.stringify(current)}`,
    async ({ thisTest, llmPage: page, llmContext: context }) => {

      test.setTimeout(5 * 60 * 1000);

      // Start debugging script here
      await page.goto("https://www.automationexercise.com");

      await My.LLM.runPrompt(page, `Search for polo shirts`)

      const url = await page.url()
      await expect(url).toContain('brand_products/Polo')
    });
}