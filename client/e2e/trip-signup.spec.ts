import { test, expect } from '@playwright/test';
import { stubPayPalSdk, stubApi, FAKE_USER } from './helpers';

const MEET_ID = 42;
const MEET = {
  id: MEET_ID,
  title: 'Lake District Weekend',
  price: 25,
  disabled: false,
  signupControl: 'Everyone',
  questions: [],
  maxSignups: 20,
};

test.describe('Trip signup journey', () => {
  test.beforeEach(async ({ page }) => {
    await stubPayPalSdk(page);
  });

  test('user with complete profile reaches the payment screen', async ({ page }) => {
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'POST /api/meets/view': MEET,
      'POST /api/paypal/required': true,
    });

    await page.goto(`/meets/upcoming/register/${MEET_ID}`);
    await expect(page.getByText(/Trip Registration/i)).toBeVisible();

    await page.getByRole('checkbox', { name: /data safety policy/i }).check();
    await page.getByRole('button', { name: /complete registration/i }).click();

    await expect(page.getByText(/Final Step: Secure Payment/i)).toBeVisible();
    await expect(page.getByText('£25.00')).toBeVisible();
    await expect(page.getByTestId('paypal-stub-button')).toBeVisible();
  });

  test('user with missing profile fields sees them listed', async ({ page }) => {
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'POST /api/meets/view': MEET,
      'POST /api/paypal/required': {
        err: 'You need to complete your profile to do that!',
        missingFields: ['dob', 'postCode'],
      },
    });

    await page.goto(`/meets/upcoming/register/${MEET_ID}`);
    await page.getByRole('checkbox', { name: /data safety policy/i }).check();
    await page.getByRole('button', { name: /complete registration/i }).click();

    await expect(page.getByText(/complete your profile/i)).toBeVisible();
    await expect(page.getByText('Date of birth')).toBeVisible();
    await expect(page.getByText('Post code')).toBeVisible();
  });

  test('completing payment calls /register and navigates to the meet page', async ({ page }) => {
    let registerBody: Record<string, unknown> | null = null;
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'POST /api/meets/view': MEET,
      'POST /api/paypal/required': true,
      'POST /api/paypal/register': async route => {
        registerBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'true',
        });
      },
    });

    await page.goto(`/meets/upcoming/register/${MEET_ID}`);
    await page.getByRole('checkbox', { name: /data safety policy/i }).check();
    await page.getByRole('button', { name: /complete registration/i }).click();
    await page.getByTestId('paypal-stub-button').click();

    await expect(page.getByText(/Payment successful/i)).toBeVisible();
    await page.waitForURL(`**/meets/upcoming/view/${MEET_ID}`);

    expect(registerBody).toMatchObject({
      data: { orderID: 'STUB-ORDER-ID' },
      form: { meetID: MEET_ID.toString() },
    });
  });

  test('"trip is full" error blocks the payment screen', async ({ page }) => {
    await stubApi(page, {
      'GET /api/user/': { user: FAKE_USER },
      'GET /api/member/committee': { isCommittee: false },
      'POST /api/meets/view': MEET,
      'POST /api/paypal/required': { err: 'Sorry, this trip is now full!' },
    });

    await page.goto(`/meets/upcoming/register/${MEET_ID}`);
    await page.getByRole('checkbox', { name: /data safety policy/i }).check();
    await page.getByRole('button', { name: /complete registration/i }).click();

    await expect(page.getByText(/this trip is now full/i)).toBeVisible();
    await expect(page.getByTestId('paypal-stub-button')).toHaveCount(0);
  });
});
