import { Page } from '@playwright/test';
import type { MyFacade } from './My';

class CommonFlows {
  constructor(protected my?: MyFacade) {}

  get page(): Page | undefined {
    return this.my?.page;
  }

  async search(search: string): Promise<void> {
    if (!this.page) {
      throw new Error("Page instance not available in CommonFlows");
    }
    return CommonFlows.search(this.page, search);
  }

  static async search(page: Page, search: string): Promise<void> {
    const searchXPath = "xpath=//input[@title='Google Search']";
    await page.locator(searchXPath).click();
    await page.locator(searchXPath).fill(search);
    await page.keyboard.press("Enter");
  }
}

export { CommonFlows };