import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatShowtime,
  linkableMeets,
  memberMeetFor,
  newTicketCode,
  showBritRockInSidebar,
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

describe('showBritRockInSidebar', () => {
  it.each([
    [null, false],
    [{ status: 'open', showInSidebar: true }, true],
    [{ status: 'closed', showInSidebar: true }, true],
    [{ status: 'open', showInSidebar: false }, false],
    [{ status: 'draft', showInSidebar: true }, false],
  ] as const)('%o → %s', (event, expected) => {
    expect(showBritRockInSidebar(event)).toBe(expected);
  });
});

describe('linkableMeets', () => {
  const meet = (id: number, startDate: string, endDate = startDate, hidden = false) => ({
    id,
    title: `Meet ${id}`,
    startDate: `${startDate}T00:00:00.000Z`,
    endDate: `${endDate}T00:00:00.000Z`,
    hidden,
  });
  const now = new Date('2026-11-16T15:00:00Z');

  it('keeps meets that have not ended, hidden ones included, soonest first', () => {
    const result = linkableMeets(
      [
        meet(3, '2026-12-01'),
        meet(1, '2026-11-01'),
        meet(2, '2026-11-17', '2026-11-17', true),
        meet(4, '2026-11-16'),
      ],
      now
    );
    expect(result.map(m => m.id)).toEqual([4, 2, 3]);
  });

  it('keeps a multi-day meet that is still running', () => {
    expect(linkableMeets([meet(5, '2026-11-14', '2026-11-18')], now)).toHaveLength(1);
  });
});

describe('memberMeetFor', () => {
  it('makes a members-only meet on the screening day', () => {
    expect(
      memberMeetFor(
        {
          description: 'Three films.',
          location: 'Divinity School',
          startsAt: '2026-11-17T19:30',
        },
        'Brit Rock (members)',
        8
      )
    ).toEqual({
      title: 'Brit Rock (members)',
      subtitle: 'Member tickets',
      desc: 'Three films.',
      location: 'Divinity School',
      startDate: '2026-11-17',
      endDate: '2026-11-17',
      type: 'Social',
      signupControl: 'Members',
      disabled: false,
      hidden: false,
      questions: [],
      price: 8,
      maxSignups: null,
    });
  });
});
