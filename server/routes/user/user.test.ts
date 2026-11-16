/**
 * Saving a profile must keep every field the BMC needs filled in.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const required = [
  'firstName',
  'lastName',
  'dob',
  'phone',
  'emergencyName',
  'emergencyPhone',
  'address1',
  'postCode',
  'country',
  'college',
];

const userService = vi.hoisted(() => ({
  getRequiredFields: vi.fn(),
  updateInfo: vi.fn(),
}));

vi.mock('../middleware.js', () => ({
  committeeAuth: vi.fn(),
  userAuth: vi.fn(),
}));
vi.mock('../../services/index.js', () => ({ userService }));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { handleRegister } = await import('./user.js');

const complete = Object.fromEntries(required.map(f => [f, 'x']));

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const save = async (body: object) => {
  const res = fakeRes();
  await handleRegister({ body, user: { id: 'u1' } } as any, res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  userService.getRequiredFields.mockResolvedValue(required);
  userService.updateInfo.mockResolvedValue([1]);
});

describe('handleRegister (/register)', () => {
  it('saves a complete profile', async () => {
    const res = await save({ ...complete, city: 'Cambridge' });
    expect(userService.updateInfo).toHaveBeenCalledWith(
      { ...complete, city: 'Cambridge' },
      'u1'
    );
    expect(res.json).toHaveBeenCalledWith(true);
  });

  it.each([
    ['missing', { dob: undefined }],
    ['empty', { dob: '' }],
    ['whitespace', { dob: '   ' }],
  ])('refuses a %s required field', async (_, change) => {
    const res = await save({ ...complete, ...change });
    expect(res.json).toHaveBeenCalledWith({
      err: expect.any(String),
      missingFields: ['dob'],
    });
    expect(userService.updateInfo).not.toHaveBeenCalled();
  });

  it('refuses an empty body', async () => {
    const res = await save({});
    expect(res.json.mock.calls[0][0].missingFields).toEqual(required);
    expect(userService.updateInfo).not.toHaveBeenCalled();
  });
});
