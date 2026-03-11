import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module before importing userService
vi.mock('../database/database.js', () => {
  const mockUserModel = {
    findByPk: vi.fn(),
    upsert: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    getAttributes: vi.fn().mockReturnValue({}),
  };
  const mockMemberModel = {};
  const required = [
    'firstName', 'lastName', 'dob', 'college', 'phone',
    'address1', 'postCode', 'country', 'emergencyName', 'emergencyPhone',
  ] as const;
  return { UserModel: mockUserModel, MemberModel: mockMemberModel, required };
});

// Import after mocking
const { UserModel } = await import('../database/database.js');
const { userService } = await import('./userService.js');

describe('userService.isProfileIncomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when user does not exist', async () => {
    vi.mocked(UserModel.findByPk).mockResolvedValue(null);

    const result = await userService.isProfileIncomplete('nonexistent');

    expect(result).toBe(true);
  });

  it('returns true when required fields are missing', async () => {
    const incompleteUser = {
      get: (field: string) => {
        const data: Record<string, string | null> = {
          firstName: 'Test',
          lastName: null,
          dob: null,
          college: null,
          phone: null,
          address1: null,
          postCode: null,
          country: null,
          emergencyName: null,
          emergencyPhone: null,
        };
        return data[field] ?? null;
      },
    };
    vi.mocked(UserModel.findByPk).mockResolvedValue(incompleteUser as any);

    const result = await userService.isProfileIncomplete('12345');

    expect(result).toBe(true);
  });

  it('returns true when required fields are empty strings', async () => {
    const emptyUser = {
      get: (field: string) => {
        const data: Record<string, string> = {
          firstName: 'Test',
          lastName: 'User',
          dob: '',
          college: 'Queens',
          phone: '07700000000',
          address1: '1 Test St',
          postCode: 'CB1 1AA',
          country: 'UK',
          emergencyName: 'Mum',
          emergencyPhone: '07700000001',
        };
        return data[field] ?? '';
      },
    };
    vi.mocked(UserModel.findByPk).mockResolvedValue(emptyUser as any);

    const result = await userService.isProfileIncomplete('12345');

    expect(result).toBe(true);
  });

  it('returns false when all required fields are filled', async () => {
    const completeUser = {
      get: (field: string) => {
        const data: Record<string, string> = {
          firstName: 'Test',
          lastName: 'User',
          dob: '2000-01-01',
          college: 'Queens',
          phone: '07700000000',
          address1: '1 Test St',
          postCode: 'CB1 1AA',
          country: 'UK',
          emergencyName: 'Mum',
          emergencyPhone: '07700000001',
        };
        return data[field] ?? '';
      },
    };
    vi.mocked(UserModel.findByPk).mockResolvedValue(completeUser as any);

    const result = await userService.isProfileIncomplete('12345');

    expect(result).toBe(false);
  });
});
