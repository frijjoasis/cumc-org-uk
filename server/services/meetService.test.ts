import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Op } from 'sequelize';

const MeetModel = vi.hoisted(() => ({ findAll: vi.fn() }));

vi.mock('../database/database.js', () => ({
  MeetModel,
  SignupModel: {},
  UserModel: {},
}));

const { meetService } = await import('./meetService.js');

const upcomingWhere = async () => {
  await meetService.getAllUpcoming();
  return MeetModel.findAll.mock.calls[0][0].where;
};

beforeEach(() => {
  vi.clearAllMocks();
  MeetModel.findAll.mockResolvedValue([]);
  vi.useFakeTimers();
});

afterEach(() => vi.useRealTimers());

describe('meetService.getAllUpcoming', () => {
  it('keeps a meet listed until the end of its last day', async () => {
    // 10am on the Saturday of a Sat–Sun meet stored as midnight UTC dates
    vi.setSystemTime(new Date('2026-11-07T10:00:00Z'));
    const where = await upcomingWhere();

    const cutoff: Date = where.endDate[Op.gte];
    expect(cutoff.toISOString()).toBe('2026-11-07T00:00:00.000Z');
    expect(where).not.toHaveProperty('startDate');
    // A meet ending today (stored as today's midnight) is still included.
    expect(new Date('2026-11-07T00:00:00Z') >= cutoff).toBe(true);
    // One that ended yesterday is not.
    expect(new Date('2026-11-06T00:00:00Z') >= cutoff).toBe(false);
  });

  it('still leaves out hidden meets', async () => {
    vi.setSystemTime(new Date('2026-11-07T10:00:00Z'));
    expect((await upcomingWhere()).hidden).toBe(false);
  });
});
