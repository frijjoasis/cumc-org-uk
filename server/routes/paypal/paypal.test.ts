import { describe, it, expect, vi, beforeEach } from 'vitest';

const client = vi.hoisted(() => ({
  verifyOrder: vi.fn(),
  authorizeOrder: vi.fn(),
  captureAuthorization: vi.fn(),
  voidAuthorization: vi.fn(),
}));

vi.mock('./paypalClient.js', async importOriginal => ({
  ...(await importOriginal<typeof import('./paypalClient.js')>()),
  PayPalClient: vi.fn(function () {
    return client;
  }),
}));
vi.mock('../middleware.js', () => ({
  committeeAuth: vi.fn(),
  userAuth: vi.fn(),
}));
vi.mock('../../services/index.js', () => ({}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { executePaymentWorkflow } = await import('./paypal.js');

const ctx = { intent: 'register' as const, userID: 'u1' };
const authorizeOnly = (onSuccess: () => Promise<void>) =>
  executePaymentWorkflow({
    orderID: 'ORDER-1',
    price: '20.00',
    capture: false,
    ctx,
    onSuccess,
  });

beforeEach(() => {
  vi.clearAllMocks();
  client.verifyOrder.mockResolvedValue(true);
  client.authorizeOrder.mockResolvedValue('AUTH-1');
  client.voidAuthorization.mockResolvedValue(true);
});

describe('executePaymentWorkflow (authorise only)', () => {
  it('saves the signup and leaves the authorization in place', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    expect(await authorizeOnly(onSuccess)).toBeNull();
    expect(onSuccess).toHaveBeenCalledWith('AUTH-1');
    expect(client.voidAuthorization).not.toHaveBeenCalled();
  });

  it('voids the hold when the trip filled up while paying', async () => {
    const result = await authorizeOnly(() =>
      Promise.reject(new Error('MEET_FULL'))
    );
    expect(client.voidAuthorization).toHaveBeenCalledWith('AUTH-1', ctx);
    expect(result?.err).toMatch(/Trip filled up.*hold.*released/);
  });

  it('voids the hold when saving the signup fails for any other reason', async () => {
    const result = await authorizeOnly(() =>
      Promise.reject(new Error('connection reset'))
    );
    expect(client.voidAuthorization).toHaveBeenCalledWith('AUTH-1', ctx);
    expect(result?.err).toMatch(/couldn't save your signup.*released/);
  });

  it('tells the member to contact the webmaster if the void also fails', async () => {
    client.voidAuthorization.mockResolvedValue({ err: 'x', code: 'TIMEOUT' });
    const result = await authorizeOnly(() =>
      Promise.reject(new Error('MEET_FULL'))
    );
    expect(result?.err).toMatch(/contact the webmaster/);
    expect(result?.err).not.toMatch(/not been charged/);
  });

  it('never reaches the signup if authorization fails', async () => {
    client.authorizeOrder.mockResolvedValue({
      err: 'declined',
      code: 'INSTRUMENT_DECLINED',
    });
    const onSuccess = vi.fn();
    expect(await authorizeOnly(onSuccess)).toEqual({
      err: 'declined',
      code: 'INSTRUMENT_DECLINED',
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('executePaymentWorkflow (capture)', () => {
  it('never voids after money has moved', async () => {
    client.captureAuthorization.mockResolvedValue('CAPTURE-1');
    await expect(
      executePaymentWorkflow({
        orderID: 'ORDER-1',
        price: '30.00',
        capture: true,
        ctx: { intent: 'membership' },
        onSuccess: () => Promise.reject(new Error('db down')),
      })
    ).rejects.toThrow('db down');
    expect(client.voidAuthorization).not.toHaveBeenCalled();
  });
});
