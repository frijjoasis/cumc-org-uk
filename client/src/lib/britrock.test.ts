import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatShowtime,
  newTicketCode,
  toLocalInput,
} from './britrock';

describe('toLocalInput', () => {
  it('formats a date for a datetime-local input', () => {
    expect(toLocalInput(new Date(2026, 10, 17, 19, 5))).toBe('2026-11-17T19:05');
  });

  it('round-trips through the input', () => {
    const value = '2026-11-17T19:30';
    expect(toLocalInput(new Date(value).toISOString())).toBe(value);
  });

  it.each([null, undefined, '', 'nonsense'])('is blank for %o', value => {
    expect(toLocalInput(value)).toBe('');
  });
});

describe('formatShowtime', () => {
  it('shows the date and time', () => {
    expect(formatShowtime(new Date(2026, 10, 17, 19, 30))).toBe(
      '17 Nov 2026 @ 7:30pm'
    );
  });
});

describe('formatPrice', () => {
  it.each([
    [12, '£12.00'],
    [8.5, '£8.50'],
  ])('%d → %s', (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });
});

describe('newTicketCode', () => {
  it('makes a 123-456 style code', () => {
    for (let i = 0; i < 50; i++) {
      expect(newTicketCode()).toMatch(/^[1-9]\d{2}-[1-9]\d{2}$/);
    }
  });
});
