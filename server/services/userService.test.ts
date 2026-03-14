import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module before importing userService
vi.mock('../database/database.js', () => {
  const mockUserModel = {
    findByPk: vi.fn(),
    upsert: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    getAttributes: vi.fn().mockReturnValue({
      firstName: { allowNull: true },
      lastName: { allowNull: true },
      dob: { allowNull: true },
      phone: { allowNull: true },
      emergencyName: { allowNull: true },
      emergencyPhone: { allowNull: true },
      college: { allowNull: true },
      address1: { allowNull: true },
      postCode: { allowNull: true },
      country: { allowNull: true },
      id: { allowNull: false },
    }),
  };
  const mockMemberModel = {};
  const required = [
    'firstName', 'lastName', 'dob', 'phone', 'emergencyName', 'emergencyPhone',
  ] as const;
  return { UserModel: mockUserModel, MemberModel: mockMemberModel, required };
});

// Import after mocking
const { UserModel } = await import('../database/database.js');
const { userService } = await import('./userService.js');

const makeUser = (overrides: Record<string, string | null> = {}) => {
  const defaults: Record<string, string | null> = {
    firstName: 'Rosanna',
    lastName: 'Brookes',
    dob: '2000-01-01',
    phone: '07700000000',
    emergencyName: 'Mum',
    emergencyPhone: '07700000001',
    college: null,
    address1: null,
    postCode: null,
    country: null,
  };
  const data = { ...defaults, ...overrides };
  return { get: (field: string) => data[field] ?? null };
};

describe('userService.isProfileIncomplete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true when user does not exist', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(null);
    expect(await userService.isProfileIncomplete('nonexistent')).toBe(true);
  });

  it('returns true when a required field is null', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(makeUser({ firstName: null }) as any);
    expect(await userService.isProfileIncomplete('123')).toBe(true);
  });

  it('returns true when a required field is an empty string', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(makeUser({ dob: '' }) as any);
    expect(await userService.isProfileIncomplete('123')).toBe(true);
  });

  it('returns false when all required fields are filled (optional fields absent)', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(makeUser() as any);
    expect(await userService.isProfileIncomplete('123')).toBe(false);
  });

  it('returns false when all fields including optional ones are filled', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(makeUser({
      college: 'Queens',
      address1: '1 Test St',
      postCode: 'CB1 1AA',
      country: 'UK',
    }) as any);
    expect(await userService.isProfileIncomplete('123')).toBe(false);
  });

  it('returns true when emergency contact name is missing', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(makeUser({ emergencyName: null }) as any);
    expect(await userService.isProfileIncomplete('123')).toBe(true);
  });

  it('returns true when emergency contact phone is missing', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(makeUser({ emergencyPhone: '' }) as any);
    expect(await userService.isProfileIncomplete('123')).toBe(true);
  });
});

describe('userService.updateInfo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls UserModel.update with provided fields', async () => {
    vi.mocked(UserModel.update).mockResolvedValue([1] as any);

    const data = { firstName: 'Rosanna', lastName: 'Brookes' };
    const [count] = await userService.updateInfo(data, '112484808749562154155');

    expect(UserModel.update).toHaveBeenCalledWith(
      data,
      expect.objectContaining({ where: { id: '112484808749562154155' } })
    );
    expect(count).toBe(1);
  });

  it('returns 0 affected rows when user does not exist', async () => {
    vi.mocked(UserModel.update).mockResolvedValue([0] as any);

    const [count] = await userService.updateInfo({ firstName: 'Ghost' }, 'nonexistent');
    expect(count).toBe(0);
  });

  it('does not allow updating id', async () => {
    vi.mocked(UserModel.update).mockResolvedValue([1] as any);

    await userService.updateInfo({ firstName: 'Test' } as any, '123');

    const call = vi.mocked(UserModel.update).mock.calls[0];
    const options = call[1] as any;
    expect(options.fields).not.toContain('id');
  });

  it('only updates allowNull fields', async () => {
    vi.mocked(UserModel.update).mockResolvedValue([1] as any);

    await userService.updateInfo({ firstName: 'Test' } as any, '123');

    const call = vi.mocked(UserModel.update).mock.calls[0];
    const options = call[1] as any;
    // id has allowNull: false so it should be excluded
    expect(options.fields).not.toContain('id');
    // nullable fields should be included
    expect(options.fields).toContain('firstName');
  });
});
