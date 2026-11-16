/**
 * BritRock guest ticket payment: the event sets the price, the server makes
 * the ticket code, and nothing is charged when tickets can't be sold.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const client = vi.hoisted(() => ({
  verifyOrder: vi.fn(),
  authorizeOrder: vi.fn(),
  captureAuthorization: vi.fn(),
  voidAuthorization: vi.fn(),
}));

const britRockService = vi.hoisted(() => ({
  getCurrentEvent: vi.fn(),
  countTickets: vi.fn(),
  createTicket: vi.fn(),
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
vi.mock('../../services/index.js', () => ({
  userService: {},
  meetService: {},
  memberService: {},
  signupService: {},
  britRockService,
}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const { handleBritRockPayment } = await import('./paypal.js');

const openEvent = { id: 3, price: 12, capacity: 100, status: 'open' };
const form = { name: 'Lynn Hill', email: 'lynn@example.com' };

function fakeRes() {
  const res: any = {};
  res.json = vi.fn(() => res);
  res.status = vi.fn(() => res);
  return res;
}

const pay = async (body: object = { data: { orderID: 'ORDER-1' }, form }) => {
  const res = fakeRes();
  await handleBritRockPayment({ body } as any, res);
  return res;
};

const expectNotCharged = () => {
  expect(client.verifyOrder).not.toHaveBeenCalled();
  expect(client.captureAuthorization).not.toHaveBeenCalled();
  expect(britRockService.createTicket).not.toHaveBeenCalled();
};

beforeEach(() => {
  vi.clearAllMocks();
  britRockService.getCurrentEvent.mockResolvedValue(openEvent);
  britRockService.countTickets.mockResolvedValue(10);
  britRockService.createTicket.mockResolvedValue({ ticket: '123-456' });
  client.verifyOrder.mockResolvedValue(true);
  client.authorizeOrder.mockResolvedValue('AUTH-1');
  client.captureAuthorization.mockResolvedValue('CAP-1');
});

describe('handleBritRockPayment (/britrock)', () => {
  it('charges the event price and returns the new ticket code', async () => {
    const res = await pay();
    expect(client.verifyOrder).toHaveBeenCalledWith('ORDER-1', '12.00');
    expect(britRockService.createTicket).toHaveBeenCalledWith(
      {
        eventID: 3,
        name: 'Lynn Hill',
        email: 'lynn@example.com',
        captureID: 'CAP-1',
      },
      undefined
    );
    expect(res.json).toHaveBeenCalledWith({ ticket: '123-456' });
  });

  it("keeps the page's suggested ticket code", async () => {
    await pay({ data: { orderID: 'ORDER-1' }, form: { ...form, ticket: '418-207' } });
    expect(britRockService.createTicket).toHaveBeenCalledWith(
      expect.anything(),
      '418-207'
    );
  });

  it('ignores a malformed code, and any id or event the browser sends', async () => {
    await pay({
      data: { orderID: 'ORDER-1' },
      form: { ...form, id: 1, ticket: '999-999; DROP', eventID: 1 },
    });
    const [saved, suggested] = britRockService.createTicket.mock.calls[0];
    expect(saved).toEqual({
      eventID: 3,
      name: 'Lynn Hill',
      email: 'lynn@example.com',
      captureID: 'CAP-1',
    });
    expect(suggested).toBeUndefined();
  });

  it('rejects a payment for a different amount', async () => {
    client.verifyOrder.mockResolvedValue({ err: 'Price mismatch detected.' });
    const res = await pay();
    expect(res.json).toHaveBeenCalledWith({ err: 'Price mismatch detected.' });
    expect(client.captureAuthorization).not.toHaveBeenCalled();
    expect(britRockService.createTicket).not.toHaveBeenCalled();
  });

  it.each([
    ['no event exists', null],
    ['the event is a draft', { ...openEvent, status: 'draft' }],
    ['sales have closed', { ...openEvent, status: 'closed' }],
  ])('refuses when %s', async (_case, event) => {
    britRockService.getCurrentEvent.mockResolvedValue(event);
    const res = await pay();
    expect(res.json).toHaveBeenCalledWith({
      err: 'BritRock tickets are not on sale right now.',
    });
    expectNotCharged();
  });

  it('refuses when sold out', async () => {
    britRockService.countTickets.mockResolvedValue(100);
    const res = await pay();
    expect(res.json).toHaveBeenCalledWith({
      err: 'Sorry, BritRock has sold out.',
    });
    expectNotCharged();
  });

  it('has no limit when capacity is unset', async () => {
    britRockService.getCurrentEvent.mockResolvedValue({
      ...openEvent,
      capacity: null,
    });
    britRockService.countTickets.mockResolvedValue(5000);
    const res = await pay();
    expect(res.json).toHaveBeenCalledWith({ ticket: '123-456' });
  });

  it('refuses missing buyer details before charging', async () => {
    const res = await pay({
      data: { orderID: 'ORDER-1' },
      form: { name: '', email: 'lynn@example.com' },
    });
    expect(res.json).toHaveBeenCalledWith({
      err: 'Please enter the attendee name.',
    });
    expectNotCharged();
  });

  it('reports an error if the ticket could not be saved after payment', async () => {
    britRockService.createTicket.mockRejectedValue(new Error('db down'));
    const res = await pay();
    expect(res.json).toHaveBeenCalledWith({
      err: 'Database error: Please contact the webmaster',
    });
  });
});
