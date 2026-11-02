import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Op } from 'sequelize';

vi.mock('../database/database.js', () => ({
  UserModel: { findAll: vi.fn() },
  MemberModel: { update: vi.fn(), findByPk: vi.fn() },
}));
vi.mock('../database/models/index.js', () => ({
  CommitteeModel: {},
  CommitteeRoleModel: {},
}));

const { UserModel, MemberModel } = await import('../database/database.js');
const { memberService } = await import('./memberService.js');

beforeEach(() => vi.clearAllMocks());

describe('memberService.listUsedWaivers', () => {
  it('fetches users who have used their waiver or are paid members', async () => {
    vi.mocked(UserModel.findAll).mockResolvedValue([]);
    await memberService.listUsedWaivers();

    const [opts] = vi.mocked(UserModel.findAll).mock.calls[0] as any;
    const [include] = opts.include;
    expect(include.model).toBe(MemberModel);
    expect(include.as).toBe('member');
    expect(include.attributes).toEqual(['hasPaid']);
    expect(include.where).toEqual({
      [Op.or]: [{ hasFree: false }, { hasPaid: true }],
    });
  });

  it('only exposes non-sensitive user fields', async () => {
    vi.mocked(UserModel.findAll).mockResolvedValue([]);
    await memberService.listUsedWaivers();

    const [opts] = vi.mocked(UserModel.findAll).mock.calls[0] as any;
    expect(opts.attributes).toEqual([
      'id', 'firstName', 'lastName', 'displayName', 'email', 'college',
    ]);
  });
});

describe('memberService.resetWaiver', () => {
  it('restores the waiver for an unpaid member', async () => {
    vi.mocked(MemberModel.update).mockResolvedValue([1] as any);
    expect(await memberService.resetWaiver('123')).toBe(1);
    expect(MemberModel.update).toHaveBeenCalledWith(
      { hasFree: true },
      { where: { id: '123', hasPaid: false } }
    );
  });

  it('reports nothing changed when the member is paid or missing', async () => {
    vi.mocked(MemberModel.update).mockResolvedValue([0] as any);
    expect(await memberService.resetWaiver('123')).toBe(0);
  });
});
