import { describe, it, expect, vi, beforeEach } from 'vitest';

// paypalClient.ts pulls in the DB-backed audit log and the file logger.
vi.mock('../../services/index.js', () => ({
  paymentEventService: { record: vi.fn() },
}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const {
  canCapturePayment,
  canVoidPayment,
  captureSignup,
  voidSignup,
  PaymentStatus,
} = await import('./committeePayments.js');

const ctx = { intent: 'register' as const, performedBy: 'committee-1' };
const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

function fakeClient() {
  return {
    getAuthorization: vi.fn(),
    getOrderCaptureID: vi.fn(),
    captureAuthorization: vi.fn(),
    voidAuthorization: vi.fn(),
  };
}
type FakeClient = ReturnType<typeof fakeClient>;
let client: FakeClient;

const capture = (price = '20.00', attemptID = 'attempt-1') =>
  captureSignup(client as any, 'AUTH-1', price, { attemptID, ctx });

beforeEach(() => {
  client = fakeClient();
  client.getAuthorization.mockResolvedValue({
    status: 'CREATED',
    amount: '20.00',
    orderID: 'ORDER-1',
    expirationTime: future,
  });
});

describe('canCapturePayment / canVoidPayment', () => {
  it.each([
    [null, true, true],
    ['Capture Failed', true, true],
    ['Capture Failed: PAYER_CANNOT_PAY', true, true],
    ['Void Failed: INVALID_RESOURCE_ID', false, true],
    ['Void', false, false],
    ['Expired', false, false],
    ['CAPTURE-123', false, false],
  ])('captureID=%s → capture %s, void %s', (captureID, cap, vd) => {
    const signup = { authID: 'AUTH-1', captureID };
    expect(canCapturePayment(signup)).toBe(cap);
    expect(canVoidPayment(signup)).toBe(vd);
  });

  it('never allows either without an authID', () => {
    expect(canCapturePayment({ authID: null, captureID: null })).toBe(false);
    expect(canVoidPayment({ authID: null, captureID: null })).toBe(false);
  });
});

describe('captureSignup', () => {
  it('captures the meet price with a per-attempt idempotency key', async () => {
    client.captureAuthorization.mockResolvedValue('CAPTURE-1');

    expect(await capture('20', 'click-abc')).toEqual({
      result: 'done',
      store: 'CAPTURE-1',
      note: undefined,
    });
    expect(client.captureAuthorization).toHaveBeenCalledWith(
      'AUTH-1',
      '20.00',
      ctx,
      'capture-AUTH-1-click-abc'
    );
  });

  it('captures a lower meet price as-is', async () => {
    client.captureAuthorization.mockResolvedValue('CAPTURE-1');
    await capture('15.5');
    expect(client.captureAuthorization.mock.calls[0][1]).toBe('15.50');
  });

  it('caps the capture at the authorised amount when the price went up', async () => {
    client.captureAuthorization.mockResolvedValue('CAPTURE-1');
    const outcome = await capture('25.00');
    expect(client.captureAuthorization.mock.calls[0][1]).toBe('20.00');
    expect(outcome).toMatchObject({ result: 'done' });
    expect((outcome as { note?: string }).note).toMatch(/£20\.00.*£25\.00/);
  });

  it('records the existing capture when PayPal already captured it', async () => {
    client.getAuthorization.mockResolvedValue({
      status: 'CAPTURED',
      amount: '20.00',
      orderID: 'ORDER-1',
    });
    client.getOrderCaptureID.mockResolvedValue('CAPTURE-EXISTING');

    expect(await capture()).toEqual({
      result: 'recovered',
      store: 'CAPTURE-EXISTING',
    });
    expect(client.captureAuthorization).not.toHaveBeenCalled();
  });

  it('falls back to a placeholder when the capture ID cannot be found', async () => {
    client.getAuthorization.mockResolvedValue({
      status: 'CAPTURED',
      amount: '20.00',
    });
    expect(await capture()).toEqual({
      result: 'recovered',
      store: PaymentStatus.CAPTURED_ON_PAYPAL,
    });
  });

  it('recovers when the capture itself says already captured', async () => {
    client.captureAuthorization.mockResolvedValue({
      err: 'x',
      code: 'AUTHORIZATION_ALREADY_CAPTURED',
    });
    client.getOrderCaptureID.mockResolvedValue('CAPTURE-EXISTING');
    expect(await capture()).toEqual({
      result: 'recovered',
      store: 'CAPTURE-EXISTING',
    });
  });

  it.each([
    ['VOIDED', 'Void', 'AUTHORIZATION_VOIDED'],
    ['EXPIRED', 'Expired', 'AUTHORIZATION_EXPIRED'],
    ['DENIED', 'Capture Failed: AUTHORIZATION_DENIED', 'AUTHORIZATION_DENIED'],
  ])('does not attempt capture when status is %s', async (status, store, issue) => {
    client.getAuthorization.mockResolvedValue({ status, amount: '20.00' });
    expect(await capture()).toEqual({ result: 'failed', store, issue });
    expect(client.captureAuthorization).not.toHaveBeenCalled();
  });

  it('treats a past expiration time as expired', async () => {
    client.getAuthorization.mockResolvedValue({
      status: 'CREATED',
      amount: '20.00',
      expirationTime: past,
    });
    expect(await capture()).toMatchObject({ store: 'Expired' });
    expect(client.captureAuthorization).not.toHaveBeenCalled();
  });

  it.each(['PAYER_CANNOT_PAY', 'PAYER_ACCOUNT_LOCKED_OR_CLOSED'])(
    'stores the PayPal reason for %s',
    async issue => {
      client.captureAuthorization.mockResolvedValue({ err: 'x', code: issue });
      expect(await capture()).toEqual({
        result: 'failed',
        store: `Capture Failed: ${issue}`,
        issue,
      });
    }
  );

  it('stores INVALID_RESOURCE_ID when PayPal does not know the authorization', async () => {
    client.getAuthorization.mockResolvedValue({
      err: 'x',
      code: 'INVALID_RESOURCE_ID',
    });
    expect(await capture()).toEqual({
      result: 'failed',
      store: 'Capture Failed: INVALID_RESOURCE_ID',
      issue: 'INVALID_RESOURCE_ID',
    });
  });

  it('stores UNKNOWN when there is no PayPal reason (e.g. network error)', async () => {
    client.captureAuthorization.mockResolvedValue({ err: 'x' });
    expect(await capture()).toMatchObject({
      store: 'Capture Failed: UNKNOWN',
    });
  });
});

describe('voidSignup', () => {
  const doVoid = () => voidSignup(client as any, 'AUTH-1', ctx);

  it('marks a successful void', async () => {
    client.voidAuthorization.mockResolvedValue(true);
    expect(await doVoid()).toEqual({ result: 'done', store: 'Void' });
  });

  it('treats already voided as voided', async () => {
    client.voidAuthorization.mockResolvedValue({
      err: 'x',
      code: 'AUTHORIZATION_VOIDED',
    });
    expect(await doVoid()).toEqual({ result: 'done', store: 'Void' });
  });

  it('records an expired authorization as Expired', async () => {
    client.voidAuthorization.mockResolvedValue({
      err: 'x',
      code: 'AUTHORIZATION_EXPIRED',
    });
    expect(await doVoid()).toEqual({ result: 'done', store: 'Expired' });
  });

  it('does NOT treat a 404 as voided', async () => {
    client.voidAuthorization.mockResolvedValue({
      err: 'x',
      code: 'INVALID_RESOURCE_ID',
    });
    expect(await doVoid()).toEqual({
      result: 'failed',
      store: 'Void Failed: INVALID_RESOURCE_ID',
      issue: 'INVALID_RESOURCE_ID',
    });
  });

  it('records the capture when the authorization was already captured', async () => {
    client.voidAuthorization.mockResolvedValue({
      err: 'x',
      code: 'AUTHORIZATION_ALREADY_CAPTURED',
    });
    client.getOrderCaptureID.mockResolvedValue('CAPTURE-EXISTING');
    expect(await doVoid()).toEqual({
      result: 'failed',
      store: 'CAPTURE-EXISTING',
      issue: 'AUTHORIZATION_ALREADY_CAPTURED',
    });
  });
});
