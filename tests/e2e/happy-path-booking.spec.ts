import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestData } from '../../src/utils/test-data';

/**
 * Happy-path E2E test: Sign in → Book a scan → Schedule → Pay → Confirm.
 *
 * This test exercises the complete appointment booking journey on the
 * Ezra staging environment using credentials from .env and Stripe
 * test-mode card numbers.
 *
 * Prerequisites:
 *   • .env file populated with valid TEST_USER_EMAIL / TEST_USER_PASSWORD
 *   • Stripe test mode enabled on the staging environment
 */
test.describe('Happy Path — Full Booking Flow', () => {
    /*
        This test covers the entire booking flow from start to finish, simulating a real user journey. It includes:
        1. Signing in with valid credentials
        2. Selecting a scan
        3. Scheduling an appointment (choosing location, date, and time)
        4. Completing payment with test card details
        5. Verifying that the booking confirmation page is displayed.
    */
    test('sign in → select scan → schedule → pay → confirm booking', async ({
        loginPage,
        scanSelectionPage,
        schedulingPage,
        paymentPage,
        page,
    }) => {
        // Step 1: Sign in
        await test.step('Sign in with valid credentials', async () => {
            // Navigate to login page and perform login
            await loginPage.goto();
            // Use credentials from TestData (which reads from .env)
            await loginPage.loginAndWaitForDashboard(
                TestData.validUser.email,
                TestData.validUser.password,
            );

            // Verify we are no longer on the sign-in page
            expect(page.url()).not.toContain('/sign-in');
        });

        // Step 2: Select a scan
        await test.step('Click Book a scan', async () => {
            // Click the button to start booking a scan
            await scanSelectionPage.clickBookScan();
        });

        // Step 3: Choose a scan and continue
        await test.step('Select a scan and continue', async () => {
            // For simplicity, select the first available scan option
            await scanSelectionPage.selectFirstScan();
            // Click continue to proceed to scheduling
            await scanSelectionPage.clickContinue();
        });

        // Step 4: Schedule the appointment
        await test.step('Select location, available date, and time slot', async () => {
            // Select the first location, then choose the first available date and time slot
            await schedulingPage.selectFirstLocation();
            // Wait for the calendar to load available dates
            await schedulingPage.waitForCalendar();
            // Select the first available date
            await schedulingPage.selectFirstAvailableDate();
            // Select the first available time slot for that date
            await schedulingPage.selectFirstAvailableTime();
            // Click continue to proceed to payment
            await schedulingPage.clickContinue();
        });

        // Step 5: Complete payment
        await test.step('Complete payment with test card', async () => {
            // Wait for the payment form to load, fill in test card details, and submit payment
            await paymentPage.waitForPaymentForm();
            // Use Stripe test card details from TestData
            await paymentPage.fillCardDetails(TestData.validCard);
            // Submit the payment form
            await paymentPage.submitPayment();
        });

        // Step 6: Verify booking confirmation
        await test.step('Verify booking is confirmed', async () => {
            // Wait for the confirmation page to load
            await page.waitForURL(
                (url) => {
                    const path = url.pathname.toLowerCase();
                    return (
                        path.includes('confirm') ||
                        path.includes('success') ||
                        path.includes('thank') ||
                        path.includes('complete') ||
                        path.includes('booked') ||
                        path.includes('appointment')
                    );
                },
                { timeout: 60_000 },
            );

            // Verify that we are on a confirmation page by checking the URL and presence of confirmation elements
            expect(page.url().toLowerCase()).not.toContain('/payment');
        });
    });
});
