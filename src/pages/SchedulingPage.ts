import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SchedulingPage extends BasePage {
  private get locationCards(): Locator {
    return this.page.locator('div.location-card');
  }

  private get calendarContainer(): Locator {
    return this.page.locator('div.calendar').first();
  }

  private get availableDays(): Locator {
    return this.page.locator(
      'div.vuecal__cell:not(.vuecal__cell--disabled):not(.vuecal__cell--out-of-scope) span.vc-day-content',
    );
  }

  private get nextMonthButton(): Locator {
    return this.page.locator('button.header-btn').last();
  }

  private get appointmentsList(): Locator {
    return this.page.locator('div.appointments__list');
  }

  private get timeSlotRadios(): Locator {
    return this.page.locator('div.appointments__individual-appointment input[type="radio"]');
  }

  private get timeSlotLabels(): Locator {
    return this.page.locator('div.appointments__individual-appointment label');
  }

  private get bookingEntries(): Locator {
    return this.page.locator('div.bookings__individual-booking');
  }

  private get continueButton(): Locator {
    return this.page.locator('button.basic.normal.yellow').filter({ hasText: 'Continue' }).last();
  }

  async selectFirstLocation(): Promise<void> {
    const first = this.locationCards.first();
    await first.waitFor({ state: 'visible', timeout: 20_000 });
    await first.click();
  }

  async waitForCalendar(): Promise<void> {
    await this.calendarContainer.waitFor({ state: 'visible', timeout: 30_000 });
    const loader = this.page.locator('div.loading-container');
    try {
      await loader.waitFor({ state: 'hidden', timeout: 45_000 });
    } catch {
      // Loader may already be gone
    }
    await this.page.locator('span.vc-day-content').first().waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.waitForTimeout(1_000);
  }

  async selectFirstAvailableDate(): Promise<void> {
    let count = await this.availableDays.count();

    for (let attempt = 0; attempt < 3 && count === 0; attempt++) {
      await this.nextMonthButton.click();
      await this.page.waitForTimeout(2_000);
      count = await this.availableDays.count();
    }

    if (count === 0) {
      throw new Error('No available dates found in the next 3 months');
    }

    await this.availableDays.first().click();
    await this.page.waitForTimeout(2_000);
  }

  async selectFirstAvailableTime(): Promise<void> {
    await this.appointmentsList.waitFor({ state: 'visible', timeout: 15_000 });
    const label = this.timeSlotLabels.first();
    await label.waitFor({ state: 'visible', timeout: 10_000 });
    await label.click();
    await this.page.waitForTimeout(1_000);
  }

  async selectRequiredTimeSlots(count: number = 1): Promise<void> {
    let dateIndex = 0;

    for (let i = 0; i < count; i++) {
      const days = this.availableDays;
      const dayCount = await days.count();
      if (dayCount === 0) {
        throw new Error(`No available dates left (needed ${count - i} more slots)`);
      }

      const idx = Math.min(dateIndex, dayCount - 1);
      await days.nth(idx).click();
      await this.page.waitForTimeout(2_000);

      await this.appointmentsList.waitFor({ state: 'visible', timeout: 15_000 });

      const labels = this.timeSlotLabels;
      const labelCount = await labels.count();
      if (labelCount === 0) {
        dateIndex++;
        i--;
        continue;
      }

      await labels.first().click();
      await this.page.waitForTimeout(1_500);
      dateIndex++;
    }
  }

  async clickContinue(): Promise<void> {
    const btn = this.continueButton;
    await expect(btn).toBeEnabled({ timeout: 15_000 });
    await btn.click();
    await this.page.waitForLoadState('load');
  }

  async scheduleAppointment(requiredSlots: number = 1): Promise<void> {
    await this.selectFirstLocation();
    await this.waitForCalendar();
    await this.selectRequiredTimeSlots(requiredSlots);
    await this.clickContinue();
  }
}
