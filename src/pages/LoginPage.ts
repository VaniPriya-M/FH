import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private get emailInput(): Locator {
    return this.page.locator('input[name="email"], input#email').first();
  }

  private get passwordInput(): Locator {
    return this.page.locator('input[name="password"], input#password').first();
  }

  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: /submit/i });
  }

  private get errorMessage(): Locator {
    return this.page.getByRole('alert');
  }

  private get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: /forgot/i });
  }

  async goto(): Promise<void> {
    await this.navigate('/sign-in');
    await this.dismissCookieBanner();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
    await this.fillInput(this.passwordInput, password);
    await this.clickWhenReady(this.submitButton);
  }

  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL((url) => !url.pathname.includes('/sign-in'), {
      timeout: 30_000,
    });
    await this.page.waitForLoadState('load');
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  async clickForgotPassword(): Promise<void> {
    await this.clickWhenReady(this.forgotPasswordLink);
  }
}
