import { describe, it, expect, vi, beforeEach } from 'vitest';

const meetService = vi.hoisted(() => ({ upsert: vi.fn() }));

vi.mock('../../services/index.js', () => ({
  meetService,
  signupService: {},
}));
vi.mock('../middleware.js', () => ({
  committeeAuth: vi.fn(),
  userAuth: vi.fn(),
}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { handleEditOrCreate, toPublicMeet } = await import('./meets.js');

const meetBody = {
  title: 'Peak District',
  startDate: '2026-11-07',
  endDate: '2026-11-08',
  type: 'Outdoor',
  questions: [{ id: 1, title: 'Need a lift?' }],
};

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const call = async (params: { id?: string }, body: object) => {
  const res = fakeRes();
  await handleEditOrCreate(
    { params, body, user: { id: 42 } } as any,
    res
  );
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  meetService.upsert.mockResolvedValue([{ id: 99, ...meetBody }, true]);
});

describe('handleEditOrCreate (/new)', () => {
  it('creates a meet with the caller as organiser', async () => {
    const res = await call({}, meetBody);
    expect(meetService.upsert).toHaveBeenCalledWith(meetBody, '42');
    expect(res.json).toHaveBeenCalledWith({ id: 99, ...meetBody });
  });

  it('ignores an id in the body so a clone can never overwrite its source', async () => {
    await call({}, { ...meetBody, id: 7 });
    const [data] = meetService.upsert.mock.calls[0];
    expect(data).not.toHaveProperty('id');
    expect(data).toEqual(meetBody);
  });
});

describe('handleEditOrCreate (/edit/:id)', () => {
  it('updates the meet named in the URL', async () => {
    await call({ id: '7' }, meetBody);
    expect(meetService.upsert).toHaveBeenCalledWith(
      { ...meetBody, id: 7 },
      '42'
    );
  });

  it('prefers the URL id over a conflicting body id', async () => {
    await call({ id: '7' }, { ...meetBody, id: 8 });
    expect(meetService.upsert.mock.calls[0][0].id).toBe(7);
  });
});

describe('handleEditOrCreate failures', () => {
  it('returns 400 when nothing was saved', async () => {
    meetService.upsert.mockResolvedValue([null, null]);
    const res = await call({}, meetBody);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ err: 'Operation failed' });
  });

  it('returns 500 on a database error', async () => {
    meetService.upsert.mockRejectedValue(new Error('connection reset'));
    const res = await call({}, meetBody);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].err).toMatch(/contact the webmaster/);
  });
});

describe('toPublicMeet', () => {
  const meet = {
    toJSON: () => ({
      id: 7,
      title: 'Peak District',
      price: 20,
      questions: [{ id: 1, title: 'Need a lift?' }],
      organiser: 'organiser-google-id',
      organiserUser: {
        firstName: 'Sam',
        lastName: 'Lead',
        phone: '07700900000',
      },
      signups: [
        {
          displayName: 'Alex',
          userID: 'u1',
          answers: [{ id: 1, value: 'true' }],
          authID: 'AUTH-1',
          captureID: 'Capture Failed: PAYER_CANNOT_PAY',
        },
        {
          displayName: 'Jo',
          userID: 'u2',
          answers: [],
          authID: 'AUTH-2',
          captureID: null,
        },
      ],
    }),
    price: 20,
  };

  it('shows logged-out visitors the meet and a count, but nobody on it', () => {
    const view = toPublicMeet(meet, null);
    expect(view).toMatchObject({ id: 7, title: 'Peak District', signupCount: 2 });
    expect(view.questions).toHaveLength(1);
    for (const key of ['signups', 'organiser', 'organiserUser', 'mySignup']) {
      expect(view).not.toHaveProperty(key);
    }
    expect(JSON.stringify(view)).not.toMatch(/07700900000|u1|AUTH/);
  });

  it('shows signed-in users names only, plus the organiser contact', () => {
    const view: any = toPublicMeet(meet, 'u2');
    expect(view.signups).toEqual([
      { displayName: 'Alex' },
      { displayName: 'Jo' },
    ]);
    expect(view.organiser).toEqual({
      firstName: 'Sam',
      lastName: 'Lead',
      phone: '07700900000',
    });
    expect(JSON.stringify(view)).not.toMatch(/organiser-google-id|AUTH|u1/);
  });

  it("includes the viewer's own answers and whether they need to pay again", () => {
    expect((toPublicMeet(meet, 'u1') as any).mySignup).toEqual({
      answers: [{ id: 1, value: 'true' }],
      needsPayment: true,
    });
    expect((toPublicMeet(meet, 'u2') as any).mySignup).toEqual({
      answers: [],
      needsPayment: false,
    });
    expect((toPublicMeet(meet, 'u3') as any).mySignup).toBeNull();
  });
});
