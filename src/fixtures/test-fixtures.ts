import { test as base } from '@playwright/test';
import { LoginPage, ScanSelectionPage, SchedulingPage, PaymentPage, ConfirmationPage } from '../pages';

type PageObjectFixtures = {
  loginPage: LoginPage;
  scanSelectionPage: ScanSelectionPage;
  schedulingPage: SchedulingPage;
  paymentPage: PaymentPage;
  confirmationPage: ConfirmationPage;
};

export const test = base.extend<PageObjectFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  scanSelectionPage: async ({ page }, use) => {
    await use(new ScanSelectionPage(page));
  },
  schedulingPage: async ({ page }, use) => {
    await use(new SchedulingPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
});

export { expect } from '@playwright/test';
