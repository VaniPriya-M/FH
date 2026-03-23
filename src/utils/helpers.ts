import { Page } from '@playwright/test';

export function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export async function withMockedRoute(
  page: Page,
  urlPattern: string,
  responseBody: unknown,
  callback: () => Promise<void>,
): Promise<void> {
  await page.route(urlPattern, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseBody),
    }),
  );
  try {
    await callback();
  } finally {
    await page.unroute(urlPattern);
  }
}

export async function captureRequestBody(
  page: Page,
  urlGlob: string,
  trigger: () => Promise<void>,
): Promise<unknown> {
  const [request] = await Promise.all([
    page.waitForRequest((req) => req.url().includes(urlGlob)),
    trigger(),
  ]);
  return request.postDataJSON();
}
