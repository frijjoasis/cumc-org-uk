import { describe, it, expect } from 'vitest';
import {
  isInvalid,
  parseEventInput,
  parseTicketBuyer,
  parseTicketCode,
} from './validate.js';

const valid = {
  title: 'Brit Rock Film Tour 2026',
  description: 'Three films.',
  location: 'Divinity School',
  startsAt: '2026-11-17T19:30:00.000Z',
  price: '12',
  capacity: '150',
  memberMeetID: '352',
  refundNote: 'No refunds after 15 November.',
  status: 'open',
};

describe('parseEventInput', () => {
  it('accepts a complete event', () => {
    expect(parseEventInput(valid)).toEqual({
      ...valid,
      startsAt: new Date(valid.startsAt),
      price: 12,
      capacity: 150,
      memberMeetID: 352,
    });
  });

  it('treats blank optional fields as unset', () => {
    const input = parseEventInput({
      ...valid,
      description: ' ',
      capacity: '',
      memberMeetID: null,
      refundNote: undefined,
    });
    expect(input).toMatchObject({
      description: null,
      capacity: null,
      memberMeetID: null,
      refundNote: null,
    });
  });

  it('defaults to a draft', () => {
    const { status: _status, ...rest } = valid;
    expect(parseEventInput(rest)).toMatchObject({ status: 'draft' });
  });

  it('rounds the price to pence', () => {
    expect(parseEventInput({ ...valid, price: '12.499' })).toMatchObject({
      price: 12.5,
    });
  });

  it('ignores fields it does not know', () => {
    const input = parseEventInput({ ...valid, id: 99, createdAt: 'x' });
    expect(input).not.toHaveProperty('id');
    expect(input).not.toHaveProperty('createdAt');
  });

  it.each([
    [{ title: '  ' }, /title/],
    [{ location: '' }, /where/],
    [{ startsAt: '' }, /date/],
    [{ startsAt: 'not a date' }, /date/],
    [{ price: '0' }, /price/],
    [{ price: '-5' }, /price/],
    [{ price: 'free' }, /price/],
    [{ capacity: '1.5' }, /Capacity/],
    [{ capacity: '0' }, /Capacity/],
    [{ memberMeetID: 'abc' }, /meet/],
    [{ status: 'live' }, /status/],
  ])('rejects %o', (change, message) => {
    const input = parseEventInput({ ...valid, ...change });
    expect(isInvalid(input)).toBe(true);
    expect((input as { err: string }).err).toMatch(message);
  });
});

describe('parseTicketBuyer', () => {
  it('trims the name and email', () => {
    expect(
      parseTicketBuyer({ name: ' Lynn Hill ', email: ' lynn@example.com ' })
    ).toEqual({ name: 'Lynn Hill', email: 'lynn@example.com' });
  });

  it('drops anything else the browser sends', () => {
    expect(
      parseTicketBuyer({ name: 'A', email: 'a@b.co', id: 1, ticket: '123-456' })
    ).toEqual({ name: 'A', email: 'a@b.co' });
  });

  it.each([
    [{ email: 'a@b.co' }, /name/],
    [{ name: 'A', email: 'not-an-email' }, /email/],
    [undefined, /name/],
  ])('rejects %o', (form, message) => {
    const buyer = parseTicketBuyer(form);
    expect(isInvalid(buyer)).toBe(true);
    expect((buyer as { err: string }).err).toMatch(message);
  });
});

describe('parseTicketCode', () => {
  it('keeps a well-formed code', () => {
    expect(parseTicketCode({ ticket: '418-207' })).toBe('418-207');
  });

  it.each([
    [{ ticket: '418207' }],
    [{ ticket: '012-345' }],
    [{ ticket: '418-207 ' }],
    [{ ticket: 418207 }],
    [{}],
    [undefined],
  ])('drops %o', form => {
    expect(parseTicketCode(form)).toBeUndefined();
  });
});
