import { describe, it, expect, vi, beforeEach } from 'vitest';

const britRockService = vi.hoisted(() => ({
  getCurrentEvent: vi.fn(),
  countTickets: vi.fn(),
  getTickets: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}));
const memberService = vi.hoisted(() => ({ getCommitteeRole: vi.fn() }));

vi.mock('../../services/index.js', () => ({ britRockService, memberService }));
vi.mock('../middleware.js', () => ({ committeeAuth: vi.fn() }));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { handleGetEvent, handleGetAdmin, handleSaveEvent } = await import(
  './britrock.js'
);

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const fakeEvent = (fields: object) => ({
  id: 3,
  capacity: null,
  status: 'open',
  ...fields,
  toJSON() {
    const { toJSON: _toJSON, ...rest } = this as any;
    return rest;
  },
});

const visitor = (authenticated = false) =>
  ({ isAuthenticated: () => authenticated, user: { id: '42' } }) as any;

const eventBody = {
  title: 'Brit Rock 2026',
  location: 'Divinity School',
  startsAt: '2026-11-17T19:30:00.000Z',
  price: 12,
  status: 'draft',
};

beforeEach(() => {
  vi.clearAllMocks();
  britRockService.countTickets.mockResolvedValue(0);
});

describe('handleGetEvent (GET /)', () => {
  it('returns null when no event has been set up', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(null);
    const res = fakeRes();
    await handleGetEvent(visitor(), res);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it('shows an open event with the seats left', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(
      fakeEvent({ capacity: 100 })
    );
    britRockService.countTickets.mockResolvedValue(40);
    const res = fakeRes();
    await handleGetEvent(visitor(), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, remaining: 60, soldOut: false })
    );
  });

  it('reports a full event as sold out', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(
      fakeEvent({ capacity: 100 })
    );
    britRockService.countTickets.mockResolvedValue(103);
    const res = fakeRes();
    await handleGetEvent(visitor(), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ remaining: 0, soldOut: true })
    );
  });

  it('has no seat limit when capacity is unset', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(fakeEvent({}));
    const res = fakeRes();
    await handleGetEvent(visitor(), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ remaining: null, soldOut: false })
    );
  });

  it('hides a draft from the public', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(
      fakeEvent({ status: 'draft' })
    );
    const res = fakeRes();
    await handleGetEvent(visitor(), res);
    expect(res.json).toHaveBeenCalledWith(null);
    expect(memberService.getCommitteeRole).not.toHaveBeenCalled();
  });

  it('hides a draft from signed-in non-committee users', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(
      fakeEvent({ status: 'draft' })
    );
    memberService.getCommitteeRole.mockResolvedValue({ isCommittee: false });
    const res = fakeRes();
    await handleGetEvent(visitor(true), res);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it('previews a draft for committee', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(
      fakeEvent({ status: 'draft' })
    );
    memberService.getCommitteeRole.mockResolvedValue({ isCommittee: true });
    const res = fakeRes();
    await handleGetEvent(visitor(true), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' })
    );
  });
});

describe('handleGetAdmin (GET /admin)', () => {
  it('returns the current event and its tickets', async () => {
    const event = fakeEvent({});
    const tickets = [{ id: 1, ticket: '123-456' }];
    britRockService.getCurrentEvent.mockResolvedValue(event);
    britRockService.getTickets.mockResolvedValue(tickets);
    const res = fakeRes();
    await handleGetAdmin({} as any, res);
    expect(britRockService.getTickets).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalledWith({ event, tickets });
  });

  it('returns no tickets before any event exists', async () => {
    britRockService.getCurrentEvent.mockResolvedValue(null);
    const res = fakeRes();
    await handleGetAdmin({} as any, res);
    expect(res.json).toHaveBeenCalledWith({ event: null, tickets: [] });
  });
});

describe('handleSaveEvent (POST /admin, /admin/:id)', () => {
  const save = async (params: object, body: object) => {
    const res = fakeRes();
    await handleSaveEvent({ params, body, user: { id: '42' } } as any, res);
    return res;
  };

  it('creates a new event', async () => {
    britRockService.createEvent.mockResolvedValue({ id: 4, status: 'draft' });
    const res = await save({}, eventBody);
    expect(britRockService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Brit Rock 2026', price: 12 })
    );
    expect(res.json).toHaveBeenCalledWith({ id: 4, status: 'draft' });
  });

  it('updates the event named in the URL, not the body', async () => {
    britRockService.updateEvent.mockResolvedValue({ id: 3, status: 'open' });
    await save({ id: '3' }, { ...eventBody, id: 99 });
    expect(britRockService.updateEvent).toHaveBeenCalledWith(
      3,
      expect.not.objectContaining({ id: expect.anything() })
    );
    expect(britRockService.createEvent).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown event', async () => {
    britRockService.updateEvent.mockResolvedValue(null);
    const res = await save({ id: '9' }, eventBody);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('rejects invalid input without saving', async () => {
    const res = await save({}, { ...eventBody, price: 0 });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(britRockService.createEvent).not.toHaveBeenCalled();
  });

  it('returns a 500 on database failure', async () => {
    britRockService.createEvent.mockRejectedValue(new Error('db down'));
    const res = await save({}, eventBody);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
