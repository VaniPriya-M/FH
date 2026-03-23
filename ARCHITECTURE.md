# Architecture

How this test framework is put together, and why.

---

## Overview

```
src/                        framework code (not tests)
  pages/                    one class per page/screen
    BasePage.ts             common helpers everyone inherits
    LoginPage.ts            /sign-in
    AppointmentPage.ts      scan selection (ScanSelectionPage)
    SchedulingPage.ts       location + calendar + time slots
    PaymentPage.ts          Stripe payment iframe
    ConfirmationPage.ts     post-booking
    index.ts                barrel exports
  fixtures/
    test-fixtures.ts        wires up page objects as Playwright fixtures
  utils/
    config.ts               .env → typed config object
    test-data.ts            user creds, Stripe test cards
    helpers.ts              date utils, route mocking, request capture
  types/
    index.ts                shared interfaces

tests/
  e2e/
    happy-path-booking.spec.ts   full booking flow (the only test right now)

playwright.config.ts        single Chromium project, 2-min timeout, 1 worker
.env / .env.example         credentials and base URL
```

Framework code lives in `src/`, tests live in `tests/`. Keeps the test files short — they just call page-object methods and make assertions.

---

## Page Object Model

Each screen in the app gets its own class that extends `BasePage`. Selectors are private getters, actions are public async methods.

```
BasePage
  ├─ LoginPage
  ├─ ScanSelectionPage  (exported from AppointmentPage.ts)
  ├─ SchedulingPage
  ├─ PaymentPage
  └─ ConfirmationPage
```

`BasePage` has the stuff every page needs: `navigate()`, `fillInput()`, `clickWhenReady()`, `dismissCookieBanner()`, etc. Individual pages only define their own selectors and flows.

When a selector changes, you fix it in one file. Tests don't know or care about the DOM.

### Locator choices

We use a mix depending on what the Ezra site gives us:

- `getByRole('button', { name: /submit/i })` for the login button
- `input[name="email"]` where role-based didn't work (password field matched a link too)
- `li.encounter-list-item` for scan cards (no useful data-testid on all of them)
- `div.location-card` for location selection
- `div.vuecal__cell:not(.vuecal__cell--disabled) span.vc-day-content` for calendar days
- `div.appointments__individual-appointment label` for time slots (the actual radio inputs are hidden)
- `frameLocator('iframe[title="Secure payment input frame"]')` for Stripe

Not everything has perfect `data-testid` attributes. We used what was stable and worked.

---

## Fixtures

Page objects are injected via Playwright's fixture system:

```ts
export const test = base.extend<PageObjectFixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  scanSelectionPage: async ({ page }, use) => { await use(new ScanSelectionPage(page)); },
  // ...
});
```

Tests destructure what they need: `async ({ loginPage, schedulingPage, page }) => { ... }`. No manual construction.

---

## Test Data

Credentials and card numbers come from environment variables (`.env` file). The `TestData` class provides typed static objects:

- `TestData.validUser` — email/password from env
- `TestData.validCard` — Stripe test Visa (4242...)
- `TestData.declinedCard`, `TestData.insufficientFundsCard` — for negative scenarios later

Nothing sensitive is committed. `.env` is in `.gitignore`.

---

## Config

`playwright.config.ts` is set up for the Ezra staging site:

- **1 worker, serial execution** — avoids booking conflicts on a shared staging environment
- **2-minute test timeout** — the real site is slow (calendar loading, Stripe iframe init)
- **30s action timeout, 60s navigation timeout**
- **Chromium only** — we're testing functionality, not cross-browser compat
- **Screenshots on failure, video retained on failure, trace on first retry**

`BASE_URL` comes from `.env` so you can point it at a different environment without touching config.

---

## The Happy Path Flow

The test (`happy-path-booking.spec.ts`) walks through 6 steps:

1. **Sign in** — go to `/sign-in`, dismiss cookie banner, fill email/password, click Submit, wait for redirect
2. **Book a scan** — click "Book a scan" button on the dashboard
3. **Select scan** — click first `li.encounter-list-item`, wait for Continue to be enabled, click it
4. **Schedule** — click first location card → wait for vue-cal calendar to load (spinner disappears) → click first available date → click first time slot label → click Continue
5. **Pay** — wait for Stripe iframe to attach → fill card number, expiry, CVC inside the iframe → optionally fill ZIP → click Continue
6. **Confirm** — wait for URL to change away from payment page

### Stripe specifics

The Ezra payment page uses Stripe's Payment Element — a single iframe containing all card fields. The iframe has `title="Secure payment input frame"`. Inside it:

- `input[name="number"]` — card number
- `input[name="expiry"]` — MM / YY
- `input[name="cvc"]` — security code
- `input[name="postalCode"]` — ZIP (optional, depends on country)

We use `page.frameLocator(...)` to reach these. There's a 3-second wait after the iframe attaches because Stripe takes a moment to initialize the inputs.

### Calendar specifics

The scheduling page uses vue-cal. After clicking a location card, there's a loading spinner (`div.loading-container`) that needs to disappear before day cells become visible. We:
1. Wait for `div.calendar` to be visible
2. Wait for `div.loading-container` to be hidden (45s timeout — it can be slow)
3. Wait for `span.vc-day-content` to be visible
4. Then click the first non-disabled, in-scope day cell

If no dates are available in the current month, we click the next-month arrow and try again (up to 3 months).

---

## Assumptions

- Targeting Ezra staging (`myezra-staging.ezra.com`)
- Email/password auth, no SSO
- Stripe in test mode
- Scan plans render as `li.encounter-list-item` with a `data-testid="select-plan-submit-btn"` continue button
- Location cards are `div.location-card`, calendar is vue-cal, time slots are radio inputs with labels
- The site has a cookie consent banner that may or may not appear

---

## Trade-Offs

| What we did | Why | What could go wrong |
|---|---|---|
| Login via UI every test run | Tests the real flow | If login is down, everything fails |
| Hardcoded `waitForTimeout` calls | Calendar/Stripe are unpredictable | Breaks if server gets much slower |
| Click labels not radio inputs | Radios are visually hidden | If they restyle, selector might break |
| Single worker | Staging can't handle parallel bookings | Suite is slower |
| Static test data | Simple | Can't run in parallel with unique users |

---

## What's Next

Things worth adding if this grows beyond a single happy path:

- **API seeding** — create test users/bookings via API instead of going through the UI every time
- **Negative tests** — declined card, expired session, no available slots
- **Visual regression** — `toHaveScreenshot()` on key pages
- **Accessibility** — `@axe-core/playwright` on each page load
- **Better waits** — replace `waitForTimeout` with proper network or DOM condition waits where possible
- **Parallel-safe data** — generate unique email per test run to allow parallel execution
