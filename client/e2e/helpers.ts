import type { Page, Route } from '@playwright/test';

/**
 * Fake PayPal SDK served in place of https://www.paypal.com/sdk/js.
 *
 * Renders a plain <button> inside the container so Playwright can click it,
 * and wires that click to the host app's createOrder → onApprove sequence
 * exactly as the real SDK would.
 *
 * Mirrors the surface the component in src/components/PayPalButton uses.
 * If that surface changes, update this stub + the component together.
 */
const FAKE_PAYPAL_SDK = `
  window.paypal = {
    Buttons: function (config) {
      return {
        isEligible: function () { return true; },
        close: function () { return Promise.resolve(); },
        render: function (container) {
          const target = typeof container === 'string'
            ? document.querySelector(container)
            : container;
          if (!target) return Promise.resolve();
          // Idempotent: clear anything the library (or a prior render) left.
          target.innerHTML = '';
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = 'Pay with PayPal (stub)';
          btn.setAttribute('data-testid', 'paypal-stub-button');
          btn.addEventListener('click', async () => {
            const actions = {
              order: {
                create: async (payload) => {
                  window.__lastCreateOrderPayload = payload;
                  return 'STUB-ORDER-ID';
                },
              },
            };
            await config.createOrder({}, actions);
            await config.onApprove({ orderID: 'STUB-ORDER-ID' }, {});
          });
          target.appendChild(btn);
          return Promise.resolve();
        },
      };
    },
  };
`;

export async function stubPayPalSdk(page: Page) {
  await page.route(/paypal\.com\/sdk/, (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: FAKE_PAYPAL_SDK,
    })
  );
}

export const FAKE_USER = {
  id: 'test-user-1',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@cam.ac.uk',
  dob: '2000-01-01',
  phone: '07700000000',
  emergencyName: 'Mum',
  emergencyPhone: '07700000001',
  college: 'Queens',
  address1: '1 Test St',
  postCode: 'CB1 1AA',
  country: 'UK',
};

type ApiStubs = Record<string, unknown | ((route: Route) => Promise<void> | void)>;

/**
 * Stub /api/* endpoints with canned responses. Pass a map of
 * "METHOD /api/path" -> JSON body, or "METHOD /api/path" -> handler fn.
 *
 * Any /api/* request without an explicit stub returns 500 so missing stubs
 * fail loudly rather than silently proxying to a real backend.
 */
export async function stubApi(page: Page, stubs: ApiStubs) {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const key = `${route.request().method()} ${url.pathname}`;
    const stub = stubs[key];
    if (stub === undefined) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ err: `No stub for ${key}` }),
      });
      return;
    }
    if (typeof stub === 'function') {
      await stub(route);
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(stub),
    });
  });
}
