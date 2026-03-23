import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestData } from '../../src/utils/test-data';

test.describe('Negative Path — Declined Payment', () => {
    test('payment is declined with a generic-decline card', async ({
        loginPage,
        scanSelectionPage,
        schedulingPage,
        paymentPage,
        page,
    }) => {
        // Step 1: Sign in
        await test.step('Sign in with valid credentials', async () => {
            await loginPage.goto();
            await loginPage.loginAndWaitForDashboard(
                TestData.validUser.email,
                TestData.validUser.password,
            );
            expect(page.url()).not.toContain('/sign-in');
        });

        // Step 2: Book a scan
        await test.step('Click Book a scan', async () => {
            await scanSelectionPage.clickBookScan();
        });

        // Step 3: Select a scan
        await test.step('Select a scan and continue', async () => {
            await scanSelectionPage.selectFirstScan();
            await scanSelectionPage.clickContinue();
        });

        // Step 4: Schedule the appointment
        await test.step('Select location, available date, and time slot', async () => {
            await schedulingPage.selectFirstLocation();
            await schedulingPage.waitForCalendar();
            await schedulingPage.selectFirstAvailableDate();
            await schedulingPage.selectFirstAvailableTime();
            await schedulingPage.clickContinue();
        });

        // Step 5: Enter declined card details and submit
        await test.step('Fill declined card details and submit payment', async () => {
            await paymentPage.waitForPaymentForm();
            // Stripe test card 4000 0000 0000 0002 triggers a generic decline
            await paymentPage.fillCardDetails(TestData.declinedCard);
            await paymentPage.submitPayment();
        });

        // Step 6: Verify we stay on the payment page and an error is shown
        await test.step('Verify payment is declined and error is displayed', async () => {
            // Give the page a moment to process and show the error
            await page.waitForTimeout(5_000);

            // We should still be on the reserve-appointment (payment) page
            expect(page.url().toLowerCase()).toContain('reserve-appointment');

            // The decline error appears inside the Stripe iframe
            const stripeFrame = page.frameLocator('iframe[title="Secure payment input frame"]');
            const errorMessage = stripeFrame.locator('#Field-numberError');
            await expect(errorMessage).toHaveText('Your card was declined.', { timeout: 10_000 });
        });
    });
});
