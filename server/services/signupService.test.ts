import { describe, it, expect, vi, beforeEach } from 'vitest';

const db = vi.hoisted(() => {
  const t = { LOCK: { UPDATE: 'UPDATE' } };
  return {
    t,
    MeetModel: { findByPk: vi.fn() },
    SignupModel: {
      count: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    sequelize: { transaction: vi.fn((cb: (t: unknown) => unknown) => cb(t)) },
  };
});

vi.mock('../database/database.js', () => db);

const { signupService } = await import('./signupService.js');

const user = { id: 'u1', displayName: 'Alex' };
const data = {
  meetID: 7,
  answers: [{ id: 1, value: 'true' }],
  authID: 'AUTH-NEW',
};

function existingSignup(fields: Record<string, unknown>) {
  const row: any = { id: 3, userID: 'u1', meetID: 7, ...fields };
  row.update = vi.fn(async (values: object) => Object.assign(row, values));
  return row;
}

beforeEach(() => {
  vi.clearAllMocks();
  db.MeetModel.findByPk.mockResolvedValue({ id: 7, maxSignups: 10 });
  db.SignupModel.count.mockResolvedValue(0);
  db.SignupModel.findOne.mockResolvedValue(null);
  db.SignupModel.create.mockImplementation(async (v: object) => ({
    id: 3,
    ...v,
  }));
});

describe('signupService.register (new signup)', () => {
  it('creates the signup with its payment', async () => {
    const { signup, replacedAuthID } = await signupService.register(
      data,
      user
    );
    expect(db.SignupModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        meetID: 7,
        userID: 'u1',
        authID: 'AUTH-NEW',
        answers: data.answers,
      }),
      { transaction: db.t }
    );
    expect(signup.id).toBe(3);
    expect(replacedAuthID).toBeNull();
  });

  it('locks the meet row while checking capacity', async () => {
    await signupService.register(data, user);
    expect(db.MeetModel.findByPk).toHaveBeenCalledWith(7, {
      transaction: db.t,
      lock: 'UPDATE',
    });
  });

  it('refuses when the trip is full', async () => {
    db.SignupModel.count.mockResolvedValue(10);
    await expect(signupService.register(data, user)).rejects.toThrow(
      'MEET_FULL'
    );
    expect(db.SignupModel.create).not.toHaveBeenCalled();
  });
});

describe('signupService.register (already signed up)', () => {
  it('never overwrites an existing payment by default', async () => {
    const row = existingSignup({ authID: 'AUTH-OLD', captureID: 'CAPTURE-1' });
    db.SignupModel.findOne.mockResolvedValue(row);

    await expect(signupService.register(data, user)).rejects.toThrow(
      'ALREADY_SIGNED_UP'
    );
    expect(row.update).not.toHaveBeenCalled();
  });

  it('refuses when canReplacePayment says no', async () => {
    const row = existingSignup({ authID: 'AUTH-OLD', captureID: null });
    db.SignupModel.findOne.mockResolvedValue(row);
    const canReplacePayment = vi.fn().mockReturnValue(false);

    await expect(
      signupService.register(data, user, { canReplacePayment })
    ).rejects.toThrow('ALREADY_SIGNED_UP');
    expect(canReplacePayment).toHaveBeenCalledWith(row);
    expect(row.update).not.toHaveBeenCalled();
  });

  it('replaces only the payment and reports the old authorization', async () => {
    const row = existingSignup({
      authID: 'AUTH-OLD',
      captureID: 'Capture Failed: PAYER_CANNOT_PAY',
    });
    db.SignupModel.findOne.mockResolvedValue(row);

    const { replacedAuthID } = await signupService.register(data, user, {
      canReplacePayment: () => true,
    });

    expect(row.update).toHaveBeenCalledWith(
      { authID: 'AUTH-NEW', captureID: null },
      { transaction: db.t }
    );
    expect(replacedAuthID).toBe('AUTH-OLD');
  });

  it('lets a member renew on a trip that has since filled up', async () => {
    db.SignupModel.count.mockResolvedValue(10);
    db.SignupModel.findOne.mockResolvedValue(
      existingSignup({ authID: 'AUTH-OLD', captureID: 'Expired' })
    );
    await expect(
      signupService.register(data, user, { canReplacePayment: () => true })
    ).resolves.toMatchObject({ replacedAuthID: 'AUTH-OLD' });
  });
});

describe('signupService.updateAnswers', () => {
  it('only touches the answers', async () => {
    db.SignupModel.update.mockResolvedValue([1]);
    await signupService.updateAnswers(3, [{ id: 1, value: 'false' }]);
    expect(db.SignupModel.update).toHaveBeenCalledWith(
      { answers: [{ id: 1, value: 'false' }] },
      { where: { id: 3 } }
    );
  });
});
