import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ScanSelectionPage extends BasePage {
  private get bookScanButton(): Locator {
    return this.page.getByRole('button', { name: /book a scan/i });
  }

  private get scanOptions(): Locator {
    return this.page.locator('li.encounter-list-item, [data-testid*="encounter-card"]');
  }

  private get continueButton(): Locator {
    return this.page.locator('[data-testid="select-plan-submit-btn"]');
  }

  async clickBookScan(): Promise<void> {
    await this.clickWhenReady(this.bookScanButton);
    await this.page.waitForLoadState('load');
  }

  async selectFirstScan(): Promise<void> {
    const first = this.scanOptions.first();
    await first.waitFor({ state: 'visible', timeout: 15_000 });
    await first.click();
  }

  async selectScanByName(name: string): Promise<void> {
    const scan = this.page.locator(`li.encounter-list-item:has-text("${name}")`).first();
    await scan.waitFor({ state: 'visible', timeout: 15_000 });
    await scan.click();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.waitFor({ state: 'visible' });
    await expect(this.continueButton).toBeEnabled({ timeout: 10_000 });
    await this.continueButton.click();
    await this.page.waitForLoadState('load');
  }

  async selectScanAndContinue(): Promise<void> {
    await this.selectFirstScan();
    await this.clickContinue();
  }
}
