/**
 * Signup form (/required) and signup payment (/register) handlers, focused on
 * members who are already signed up: editing must never ask them to pay
 * again, and paying again is only possible when their old payment could not
 * be taken.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const client = vi.hoisted(() => ({
  verifyOrder: vi.fn(),
  authorizeOrder: vi.fn(),
  captureAuthorization: vi.fn(),
  voidAuthorization: vi.fn(),
  getAuthorization: vi.fn(),
  getOrderCaptureID: vi.fn(),
}));

const services = vi.hoisted(() => ({
  userService: { getMissingProfileFields: vi.fn() },
  meetService: { getById: vi.fn() },
  memberService: { getById: vi.fn(), upsert: vi.fn() },
  signupService: {
    getForUser: vi.fn(),
    getCountByMeetId: vi.fn(),
    updateAnswers: vi.fn(),
    updatePayment: vi.fn(),
    register: vi.fn(),
  },
  britRockService: {},
}));

const logger = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
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
vi.mock('../../services/index.js', () => services);
vi.mock('../../logger.js', () => ({ logger }));

const { handleSignupForm, handleSignupPayment } = await import('./paypal.js');
const { signupService, meetService, memberService } = services;

const answers = [{ id: 1, value: 'true' }];
const paidMeet = {
  id: 7,
  price: 20,
  maxSignups: 10,
  disabled: false,
  signupControl: 'Default',
};

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const user = { id: 'u1', displayName: 'Alex' };

async function submitForm() {
  const res = fakeRes();
  await handleSignupForm(
    { user, body: { meetID: '7', answers } } as any,
    res
  );
  return res.json.mock.calls[0][0];
}

async function pay() {
  const res = fakeRes();
  await handleSignupPayment(
    {
      user,
      body: { data: { orderID: 'ORDER-1' }, form: { meetID: '7', answers } },
    } as any,
    res
  );
  return res.json.mock.calls[0][0];
}

const signedUp = (authID: string | null, captureID: string | null) => ({
  id: 3,
  userID: 'u1',
  authID,
  captureID,
});

beforeEach(() => {
  vi.clearAllMocks();
  services.userService.getMissingProfileFields.mockResolvedValue([]);
  meetService.getById.mockResolvedValue(paidMeet);
  memberService.getById.mockResolvedValue({ hasPaid: true });
  signupService.getForUser.mockResolvedValue(null);
  signupService.getCountByMeetId.mockResolvedValue(0);
  signupService.register.mockResolvedValue({
    signup: { id: 3 },
    replacedAuthID: null,
  });
  client.verifyOrder.mockResolvedValue(true);
  client.authorizeOrder.mockResolvedValue('AUTH-NEW');
  client.voidAuthorization.mockResolvedValue(true);
  client.getAuthorization.mockResolvedValue({
    status: 'CREATED',
    amount: '20.00',
  });
});

describe('signup form for a new signup', () => {
  it('asks for payment on a paid meet without saving anything yet', async () => {
    expect(await submitForm()).toBe(true);
    expect(signupService.register).not.toHaveBeenCalled();
  });

  it('signs up straight away on a free meet', async () => {
    meetService.getById.mockResolvedValue({ ...paidMeet, price: 0 });
    expect(await submitForm()).toBe(false);
    expect(signupService.register).toHaveBeenCalledWith(
      expect.objectContaining({ meetID: 7, answers, captureID: 'Not Paying' }),
      user,
      expect.anything()
    );
  });

  it('rejects a full trip', async () => {
    signupService.getCountByMeetId.mockResolvedValue(10);
    expect(await submitForm()).toEqual({ err: 'Sorry, this trip is now full!' });
  });

  it('rejects a closed trip', async () => {
    meetService.getById.mockResolvedValue({ ...paidMeet, disabled: true });
    expect(await submitForm()).toEqual({ err: 'Signups are not open!' });
  });
});

describe('editing an existing signup', () => {
  it.each([
    ['held', 'AUTH-OLD', null],
    ['captured', 'AUTH-OLD', 'CAPTURE-1'],
    ['free', null, 'Not Paying'],
    ['voided', 'AUTH-OLD', 'Void'],
  ])(
    'saves the answers and does not ask a %s signup to pay again',
    async (_, authID, captureID) => {
      signupService.getForUser.mockResolvedValue(signedUp(authID, captureID));

      expect(await submitForm()).toBe(false);
      expect(signupService.updateAnswers).toHaveBeenCalledWith(3, answers);
      expect(signupService.register).not.toHaveBeenCalled();
      expect(client.getAuthorization).not.toHaveBeenCalled();
    }
  );

  it('works on a full trip', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', null));
    signupService.getCountByMeetId.mockResolvedValue(10);
    expect(await submitForm()).toBe(false);
    expect(signupService.updateAnswers).toHaveBeenCalled();
  });

  it('skips the membership check they already passed', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', null));
    memberService.getById.mockResolvedValue({ hasPaid: false, hasFree: false });
    expect(await submitForm()).toBe(false);
  });

  it('is refused once signups close', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', null));
    meetService.getById.mockResolvedValue({ ...paidMeet, disabled: true });
    expect((await submitForm()).err).toMatch(/closed/);
    expect(signupService.updateAnswers).not.toHaveBeenCalled();
  });
});

describe('renewing a payment that could not be taken', () => {
  it('asks a member whose capture failed to pay again', async () => {
    signupService.getForUser.mockResolvedValue(
      signedUp('AUTH-OLD', 'Capture Failed: PAYER_CANNOT_PAY')
    );
    expect(await submitForm()).toBe(true);
    expect(client.getAuthorization).toHaveBeenCalledWith('AUTH-OLD');
    expect(signupService.updateAnswers).toHaveBeenCalledWith(3, answers);
  });

  it('asks a member whose hold expired to pay again without checking PayPal', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', 'Expired'));
    expect(await submitForm()).toBe(true);
    expect(client.getAuthorization).not.toHaveBeenCalled();
  });

  it('records the capture instead if the failed capture actually went through', async () => {
    signupService.getForUser.mockResolvedValue(
      signedUp('AUTH-OLD', 'Capture Failed: TIMEOUT')
    );
    client.getAuthorization.mockResolvedValue({
      status: 'CAPTURED',
      amount: '20.00',
      orderID: 'ORDER-OLD',
    });
    client.getOrderCaptureID.mockResolvedValue('CAPTURE-OLD');

    expect(await submitForm()).toBe(false);
    expect(signupService.updatePayment).toHaveBeenCalledWith(3, 'CAPTURE-OLD');
  });

  it('does not ask for payment if PayPal cannot be checked', async () => {
    signupService.getForUser.mockResolvedValue(
      signedUp('AUTH-OLD', 'Capture Failed: UNKNOWN')
    );
    client.getAuthorization.mockResolvedValue({ err: 'x', code: 'TIMEOUT' });
    expect((await submitForm()).err).toMatch(/couldn't check/);
  });

  it('is allowed after signups close, without changing answers', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', 'Expired'));
    meetService.getById.mockResolvedValue({ ...paidMeet, disabled: true });
    expect(await submitForm()).toBe(true);
    expect(signupService.updateAnswers).not.toHaveBeenCalled();
  });

  it('is not needed when the meet has become free', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', 'Expired'));
    meetService.getById.mockResolvedValue({ ...paidMeet, price: 0 });
    expect(await submitForm()).toBe(false);
  });
});

describe('paying for a signup', () => {
  it('authorizes and saves a new signup', async () => {
    expect(await pay()).toBe(true);
    expect(signupService.register).toHaveBeenCalledWith(
      expect.objectContaining({ meetID: 7, answers, authID: 'AUTH-NEW' }),
      user,
      { canReplacePayment: expect.any(Function) }
    );
    expect(client.voidAuthorization).not.toHaveBeenCalled();
  });

  it.each([
    ['held', null],
    ['captured', 'CAPTURE-1'],
  ])(
    'refuses a second payment from a member whose payment is %s, before touching PayPal',
    async (_, captureID) => {
      signupService.getForUser.mockResolvedValue(
        signedUp('AUTH-OLD', captureID)
      );
      expect((await pay()).err).toMatch(/already paid/);
      expect(client.verifyOrder).not.toHaveBeenCalled();
      expect(client.authorizeOrder).not.toHaveBeenCalled();
      expect(signupService.register).not.toHaveBeenCalled();
    }
  );

  it('releases the old hold after a renewal', async () => {
    signupService.getForUser.mockResolvedValue(
      signedUp('AUTH-OLD', 'Capture Failed: PAYER_CANNOT_PAY')
    );
    signupService.register.mockResolvedValue({
      signup: { id: 3 },
      replacedAuthID: 'AUTH-OLD',
    });

    expect(await pay()).toBe(true);
    expect(client.voidAuthorization).toHaveBeenCalledTimes(1);
    expect(client.voidAuthorization).toHaveBeenCalledWith(
      'AUTH-OLD',
      expect.objectContaining({ signupID: 3, userID: 'u1' })
    );
  });

  it('keeps the new payment and flags it if the old hold cannot be released', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', 'Expired'));
    signupService.register.mockResolvedValue({
      signup: { id: 3 },
      replacedAuthID: 'AUTH-OLD',
    });
    client.voidAuthorization.mockResolvedValue({
      err: 'x',
      code: 'INVALID_RESOURCE_ID',
    });

    expect(await pay()).toBe(true);
    expect(client.voidAuthorization).not.toHaveBeenCalledWith(
      'AUTH-NEW',
      expect.anything()
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringMatching(/CRITICAL.*old authorization/),
      expect.objectContaining({ authID: 'AUTH-OLD' })
    );
  });

  it('voids the new payment if the signup was paid for in another tab meanwhile', async () => {
    signupService.getForUser.mockResolvedValue(signedUp('AUTH-OLD', 'Expired'));
    signupService.register.mockRejectedValue(new Error('ALREADY_SIGNED_UP'));

    expect((await pay()).err).toMatch(/released/);
    expect(client.voidAuthorization).toHaveBeenCalledWith(
      'AUTH-NEW',
      expect.anything()
    );
  });

  it('keeps the signup and its payment if using up the free meet fails', async () => {
    memberService.upsert.mockRejectedValue(new Error('db down'));
    expect(await pay()).toBe(true);
    expect(client.voidAuthorization).not.toHaveBeenCalled();
  });
});
