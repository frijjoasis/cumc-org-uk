import { test, expect } from '@playwright/test';
import { stubPayPalSdk, stubApi, FAKE_USER } from './helpers';

test.describe('Membership payment journey', () => {
  test.beforeEach(async ({ page }) => {
    await stubPayPalSdk(page);
  });

  test('user can reach the payment screen when not a paid member', async ({ page }) => {
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'GET /api/user/info': FAKE_USER,
      'GET /api/member/': { member: { hasPaid: false, hasFree: true } },
      'GET /api/about/easter/': '30.00',
    });

    await page.goto('/register');

    await page.getByRole('tab', { name: /membership/i }).click();
    await expect(page.getByText(/Join the club/i)).toBeVisible();
    await expect(page.getByTestId('paypal-stub-button')).toBeVisible();
  });

  test('does NOT show the pay button when already a paid member', async ({ page }) => {
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'GET /api/user/info': FAKE_USER,
      'GET /api/member/': { member: { hasPaid: true, hasFree: false } },
      'GET /api/about/easter/': '30.00',
    });

    await page.goto('/register');
    await page.getByRole('tab', { name: /membership/i }).click();

    await expect(page.getByText(/Paid & Valid/i)).toBeVisible();
    await expect(page.getByTestId('paypal-stub-button')).toHaveCount(0);
  });

  test('completing payment navigates home and backend received orderID', async ({ page }) => {
    let membershipBody: unknown = null;
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'GET /api/user/info': FAKE_USER,
      'GET /api/member/': { member: { hasPaid: false, hasFree: true } },
      'GET /api/about/easter/': '30.00',
      'POST /api/paypal/membership': async route => {
        membershipBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'true',
        });
      },
    });

    await page.goto('/register');
    await page.getByRole('tab', { name: /membership/i }).click();
    await page.getByTestId('paypal-stub-button').click();

    await expect(page.getByText(/Payment successful/i)).toBeVisible();
    await page.waitForURL('**/home');

    expect(membershipBody).toMatchObject({
      data: { orderID: 'STUB-ORDER-ID' },
    });
  });

  test('backend error surfaces to the user', async ({ page }) => {
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'GET /api/user/info': FAKE_USER,
      'GET /api/member/': { member: { hasPaid: false, hasFree: true } },
      'GET /api/about/easter/': '30.00',
      'POST /api/paypal/membership': { err: 'Price mismatch detected.' },
    });

    await page.goto('/register');
    await page.getByRole('tab', { name: /membership/i }).click();
    await page.getByTestId('paypal-stub-button').click();

    await expect(page.getByText(/Price mismatch detected/i)).toBeVisible();
  });
});
