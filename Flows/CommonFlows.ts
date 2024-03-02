export default class CommonFlows {
  static async search(page: any, search: string) {
    const searchXPath = "xpath=//input[@title='Google Search']"
    await page.locator(searchXPath).click()
    await page.locator(searchXPath).fill(search);
    await page.keyboard.press("Enter");
  }
}