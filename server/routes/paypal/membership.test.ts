/**
 * Membership payment: an incomplete profile is turned away before PayPal is
 * touched, so nobody becomes a paid member with only an email on file.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const client = vi.hoisted(() => ({
  verifyOrder: vi.fn(),
  authorizeOrder: vi.fn(),
  captureAuthorization: vi.fn(),
  voidAuthorization: vi.fn(),
}));

const userService = vi.hoisted(() => ({ getMissingProfileFields: vi.fn() }));
const memberService = vi.hoisted(() => ({ upsert: vi.fn() }));

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
vi.mock('../../services/index.js', () => ({
  userService,
  memberService,
  meetService: {},
  signupService: {},
  britRockService: {},
}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { handleMembershipPayment } = await import('./paypal.js');

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const pay = async () => {
  const res = fakeRes();
  await handleMembershipPayment(
    { body: { data: { orderID: 'ORDER-1' } }, user: { id: 'u1' } } as any,
    res
  );
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  userService.getMissingProfileFields.mockResolvedValue([]);
  memberService.upsert.mockResolvedValue([{}, true]);
  client.verifyOrder.mockResolvedValue(true);
  client.authorizeOrder.mockResolvedValue('AUTH-1');
  client.captureAuthorization.mockResolvedValue('CAP-1');
});

describe('handleMembershipPayment (/membership)', () => {
  it('records the membership when the profile is complete', async () => {
    const res = await pay();
    expect(userService.getMissingProfileFields).toHaveBeenCalledWith('u1');
    expect(memberService.upsert).toHaveBeenCalledWith({
      id: 'u1',
      hasPaid: true,
      hasFree: false,
      paymentID: 'CAP-1',
    });
    expect(res.json).toHaveBeenCalledWith(true);
  });

  it('refuses an incomplete profile without charging or marking paid', async () => {
    userService.getMissingProfileFields.mockResolvedValue(['firstName', 'dob']);
    const res = await pay();
    expect(res.json).toHaveBeenCalledWith({
      err: expect.stringMatching(/complete your profile/),
      missingFields: ['firstName', 'dob'],
    });
    expect(client.verifyOrder).not.toHaveBeenCalled();
    expect(client.captureAuthorization).not.toHaveBeenCalled();
    expect(memberService.upsert).not.toHaveBeenCalled();
  });
});
