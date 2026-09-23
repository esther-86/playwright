import { test, expect } from '../Fixtures/fixture-use';

const test_data = [
  { ticket: 'JIRA-123', tcs: 'TE-T1' }
];
for (const current of test_data) {

  test(`Code and Prompt. ${JSON.stringify(current)}`,
    async ({ MyLLM }) => {
      test.setTimeout(5 * 60 * 1000);
      let url: string;

      // Start debugging script here
      await MyLLM.page.goto("https://www.automationexercise.com/products");
      await MyLLM.LLM.runPrompt(`Search for polo shirts. Close dialog if vignette pops up`);

      url = await MyLLM.page.url();
      await expect(url).toContain('search=polo%20shirts');
    });
}