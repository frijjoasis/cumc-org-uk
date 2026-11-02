import { describe, it, expect, vi, beforeEach } from 'vitest';

const memberService = vi.hoisted(() => ({
  getById: vi.fn(),
  listUsedWaivers: vi.fn(),
  resetWaiver: vi.fn(),
}));

vi.mock('../../services/index.js', () => ({ memberService }));
vi.mock('../middleware.js', () => ({
  committeeAuth: vi.fn(),
  userAuth: vi.fn(),
  rootAuth: vi.fn(),
}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { handleListWaivers, handleResetWaiver } = await import('./member.js');

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const reset = async (body: object) => {
  const res = fakeRes();
  await handleResetWaiver({ body, user: { id: '42' } } as any, res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  memberService.resetWaiver.mockResolvedValue(1);
});

describe('handleListWaivers (/waivers)', () => {
  it('returns the users from the service', async () => {
    const users = [{ id: '1', member: { hasPaid: false } }];
    memberService.listUsedWaivers.mockResolvedValue(users);
    const res = fakeRes();
    await handleListWaivers({} as any, res);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('returns a 500 on database failure', async () => {
    memberService.listUsedWaivers.mockRejectedValue(new Error('db down'));
    const res = fakeRes();
    await handleListWaivers({} as any, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('handleResetWaiver (/waivers/reset)', () => {
  it('resets the waiver of an unpaid member who has used it', async () => {
    memberService.getById.mockResolvedValue({ hasPaid: false, hasFree: false });
    const res = await reset({ id: '123' });
    expect(memberService.resetWaiver).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith(true);
  });

  it('accepts a numeric id', async () => {
    memberService.getById.mockResolvedValue({ hasPaid: false, hasFree: false });
    await reset({ id: 123 });
    expect(memberService.resetWaiver).toHaveBeenCalledWith('123');
  });

  it('refuses to reset a paid member', async () => {
    memberService.getById.mockResolvedValue({ hasPaid: true, hasFree: false });
    const res = await reset({ id: '123' });
    expect(memberService.resetWaiver).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      err: 'Paid members do not need a meet waiver',
    });
  });

  it.each([
    ['still has their waiver', { hasPaid: false, hasFree: true }],
    ['has no member record', null],
  ])('refuses when the user %s', async (_, member) => {
    memberService.getById.mockResolvedValue(member);
    const res = await reset({ id: '123' });
    expect(memberService.resetWaiver).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it.each([undefined, '', 'abc', '12; DROP TABLE', { $gt: 0 }])(
    'rejects invalid id %j',
    async id => {
      const res = await reset({ id });
      expect(memberService.getById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    }
  );

  it('returns a 500 on database failure', async () => {
    memberService.getById.mockResolvedValue({ hasPaid: false, hasFree: false });
    memberService.resetWaiver.mockRejectedValue(new Error('db down'));
    const res = await reset({ id: '123' });
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
