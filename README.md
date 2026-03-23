# FunH — Ezra Appointment Booking Tests

E2E tests for the Ezra scan booking flow, built with Playwright and TypeScript.

Covers: sign-in → scan selection → scheduling (location/date/time) → Stripe payment → confirmation.

---

## Setup

**Requirements:** Node.js 18+, npm 9+

```bash
npm install
npx playwright install --with-deps

```

## Running Tests

```bash
npm test                  # headless
npm run test:headed       # watch the browser
npm run test:e2e          # just the e2e suite
npm run test:debug        # step-through debugger
npm run test:report       # open last HTML report
```

## Project Layout

```
src/
  pages/
    BasePage.ts            shared helpers (nav, click, fill, wait, cookie banner)
    LoginPage.ts           /sign-in page
    AppointmentPage.ts     scan selection ("Book a scan" → pick plan → continue)
    SchedulingPage.ts      location cards, vue-cal calendar, time slots
    PaymentPage.ts         Stripe Payment Element (single iframe)
    ConfirmationPage.ts    post-booking screen
    index.ts               barrel exports
  fixtures/
    test-fixtures.ts       injects page objects into tests
  utils/
    config.ts              reads .env, exports typed config
    test-data.ts           credentials + Stripe test cards
    helpers.ts             date formatting, API mocking utils
  types/
    index.ts               shared interfaces
tests/
  e2e/
    happy-path-booking.spec.ts   the main happy-path test
playwright.config.ts
.env.example
```

## How It Works

- **Page Object Model** — each page gets its own class. Selectors live in one place; tests just call methods like `loginPage.login(email, pw)`.
- **Fixtures** — page objects are injected automatically via Playwright fixtures. No boilerplate in test files.
- **Credentials** — loaded from `.env` (git-ignored). The test never has inline secrets.
- **Stripe** — the payment page uses Stripe's Payment Element which puts all card fields in a single iframe (`title="Secure payment input frame"`). We use `frameLocator` to reach the inputs inside.
- **Calendar** — the scheduling page uses vue-cal. We wait for the loading spinner to disappear, then click available day cells and time slot labels.

## Assumptions

- The target is `https://myezra-staging.ezra.com` (or whatever `BASE_URL` you set).
- Auth is email + password on `/sign-in`. No OAuth/SSO.
- Stripe is in test mode and accepts `4242 4242 4242 4242`.
- The scan selection page renders plans as `<li class="encounter-list-item">`.
- The scheduling page shows location cards first, then a vue-cal month calendar, then time slots as radio inputs (labels are clickable, radios are visually hidden).

## Trade-Offs

| Choice | Upside | Downside |
|---|---|---|
| Login through the UI each run | Tests the real sign-in | Slower than token injection |
| Static test data | Simple, no dependencies | Could collide in parallel runs |
| Single worker, serial execution | Avoids booking conflicts on staging | Slower suite |
| `waitForTimeout` in scheduling flow | Handles slow calendar loading | Brittle if server gets slower |

## Adding a New Page

1. Create `src/pages/NewPage.ts` extending `BasePage`
2. Export from `src/pages/index.ts`
3. Add a line in `src/fixtures/test-fixtures.ts`
4. Use it: `test('...', async ({ newPage }) => { ... })`

## CI (GitHub Actions)

```yaml
name: E2E
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```
