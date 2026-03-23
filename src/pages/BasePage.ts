import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  async dismissCookieBanner(): Promise<void> {
    const acceptBtn = this.page.getByRole('button', { name: /accept/i });
    try {
      await acceptBtn.waitFor({ state: 'visible', timeout: 5_000 });
      await acceptBtn.click();
    } catch {
      // Banner didn't appear
    }
  }

  async clickWhenReady(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  async waitForUrl(pattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(pattern);
  }

  async waitForApiResponse(urlGlob: string, status = 200) {
    return this.page.waitForResponse(
      (resp) => resp.url().includes(urlGlob) && resp.status() === status,
    );
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
