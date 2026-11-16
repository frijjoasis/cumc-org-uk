import { describe, it, expect } from 'vitest';
import { formatPrice, formatShowtime, toLocalInput } from './britrock';

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
  it('shows the day, date and time', () => {
    expect(formatShowtime(new Date(2026, 10, 17, 19, 30))).toBe(
      'Tue 17 Nov 2026 @ 7:30pm'
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
