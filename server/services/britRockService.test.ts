import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueConstraintError } from 'sequelize';

vi.mock('../database/database.js', () => ({
  BritRockModel: { create: vi.fn() },
  BritRockEventModel: {},
}));

const { BritRockModel } = await import('../database/database.js');
const { britRockService, generateTicketCode } = await import(
  './britRockService.js'
);

const data = {
  eventID: 3,
  name: 'Lynn Hill',
  email: 'lynn@example.com',
  captureID: 'CAP-1',
};
const clash = () => new UniqueConstraintError({ errors: [] });

beforeEach(() => vi.clearAllMocks());

describe('generateTicketCode', () => {
  it('makes a 123-456 style code', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateTicketCode()).toMatch(/^[1-9]\d{2}-[1-9]\d{2}$/);
    }
  });
});

describe('britRockService.createTicket', () => {
  it('saves the ticket with a generated code', async () => {
    vi.mocked(BritRockModel.create).mockImplementation(
      async (values: any) => values
    );
    const ticket = await britRockService.createTicket(data);
    expect(ticket).toMatchObject(data);
    expect(ticket.ticket).toMatch(/^\d{3}-\d{3}$/);
  });

  it('draws a new code when one is already taken', async () => {
    vi.mocked(BritRockModel.create)
      .mockRejectedValueOnce(clash())
      .mockImplementation(async (values: any) => values);
    await britRockService.createTicket(data);
    expect(BritRockModel.create).toHaveBeenCalledTimes(2);
  });

  it('gives up after repeated clashes', async () => {
    vi.mocked(BritRockModel.create).mockRejectedValue(clash());
    await expect(britRockService.createTicket(data)).rejects.toBeInstanceOf(
      UniqueConstraintError
    );
    expect(BritRockModel.create).toHaveBeenCalledTimes(5);
  });

  it('does not retry other database errors', async () => {
    vi.mocked(BritRockModel.create).mockRejectedValue(new Error('db down'));
    await expect(britRockService.createTicket(data)).rejects.toThrow('db down');
    expect(BritRockModel.create).toHaveBeenCalledTimes(1);
  });
});
