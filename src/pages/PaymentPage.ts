import { Locator, FrameLocator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PaymentDetails } from '../types';

export class PaymentPage extends BasePage {
  private get stripeFrame(): FrameLocator {
    return this.page.frameLocator('iframe[title="Secure payment input frame"]');
  }

  private get cardNumberInput(): Locator {
    return this.stripeFrame.locator('input[name="number"]');
  }

  private get expiryInput(): Locator {
    return this.stripeFrame.locator('input[name="expiry"]');
  }

  private get cvcInput(): Locator {
    return this.stripeFrame.locator('input[name="cvc"]');
  }

  private get postalCodeInput(): Locator {
    return this.stripeFrame.locator('input[name="postalCode"]');
  }

  private get continueButton(): Locator {
    return this.page.locator('button.basic.normal.yellow').filter({ hasText: 'Continue' });
  }

  private get paymentError(): Locator {
    return this.page.locator('[class*="error"], [class*="Error"], [role="alert"]').first();
  }

  private get totalAmount(): Locator {
    return this.page.locator(
      '[class*="total"], [class*="Total"], [class*="amount"], [class*="price"], [class*="Price"]',
    ).first();
  }

  async waitForPaymentForm(): Promise<void> {
    await this.page.locator('iframe[title="Secure payment input frame"]')
      .waitFor({ state: 'attached', timeout: 30_000 });
    await this.page.waitForTimeout(5_000);
  }

  async fillCardDetails(details: PaymentDetails): Promise<void> {
    await this.cardNumberInput.waitFor({ state: 'visible', timeout: 10_000 });
    await this.cardNumberInput.fill(details.cardNumber);
    await this.expiryInput.fill(details.expiry);
    await this.cvcInput.fill(details.cvv);

    try {
      if (await this.postalCodeInput.isVisible({ timeout: 2_000 })) {
        await this.postalCodeInput.fill('10001');
      }
    } catch {
      // Optional field
    }
  }

  async submitPayment(): Promise<void> {
    await this.continueButton.click();
  }

  async makePayment(details: PaymentDetails): Promise<void> {
    await this.waitForPaymentForm();
    await this.fillCardDetails(details);
    await this.submitPayment();
    await this.page.waitForURL(
      (url) => {
        const path = url.pathname.toLowerCase();
        return (
          path.includes('confirm') ||
          path.includes('success') ||
          path.includes('thank') ||
          path.includes('complete') ||
          path.includes('booked')
        );
      },
      { timeout: 60_000 },
    );
  }

  async getTotalAmount(): Promise<string> {
    return this.getText(this.totalAmount);
  }

  async isPaymentErrorVisible(): Promise<boolean> {
    try {
      return await this.paymentError.isVisible({ timeout: 5_000 });
    } catch {
      return false;
    }
  }

  async getPaymentError(): Promise<string> {
    return this.getText(this.paymentError);
  }
}
