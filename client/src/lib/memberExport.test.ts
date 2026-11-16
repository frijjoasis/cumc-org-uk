import { describe, it, expect } from 'vitest';
import type { UserWithProfile } from '@cumc/shared-types';
import { membershipType, paidMemberRows, PAID_MEMBER_HEADERS } from './memberExport';

const user = (overrides: Partial<UserWithProfile>): UserWithProfile =>
  ({
    id: '1',
    email: 'a@cam.ac.uk',
    displayName: 'A',
    firstName: 'Alex',
    lastName: 'Honnold',
    address1: '1 Trinity Street',
    city: 'Cambridge',
    postCode: 'CB2 1TQ',
    college: 'Trinity',
    member: { hasPaid: true },
    ...overrides,
  }) as UserWithProfile;

describe('membershipType', () => {
  it.each([
    ['Trinity', 'Student'],
    ['Department of Engineering', 'Student'],
    ['Postgraduate - Wolfson', 'Student'],
    [null, 'Student'],
    ['', 'Student'],
    ['Alumni', 'Individual'],
    ['Trinity alumnus', 'Individual'],
    ['Staff', 'Individual'],
    ['Non-staff', 'Individual'],
    ['Engineering (staff)', 'Individual'],
    ['None', 'Individual'],
    ['N/A', 'Individual'],
    ['External', 'Individual'],
  ])('%o → %s', (college, expected) => {
    expect(membershipType(college)).toBe(expected);
  });
});

describe('paidMemberRows', () => {
  it('starts with the header row', () => {
    expect(paidMemberRows([])).toEqual([PAID_MEMBER_HEADERS]);
  });

  it('only includes paid members', () => {
    const rows = paidMemberRows([
      user({ id: '1', firstName: 'Paid' }),
      user({ id: '2', firstName: 'Unpaid', member: { hasPaid: false } as any }),
      user({ id: '3', firstName: 'NoMember', member: undefined }),
    ]);
    expect(rows.slice(1).map(r => r[0])).toEqual(['Paid']);
  });

  it('maps the profile into the export columns', () => {
    expect(paidMemberRows([user({ college: 'Staff' })])[1]).toEqual([
      'Alex',
      'Honnold',
      'a@cam.ac.uk',
      '1 Trinity Street',
      'Cambridge',
      'CB2 1TQ',
      'Individual',
    ]);
  });

  it('leaves missing fields blank', () => {
    const [, row] = paidMemberRows([
      user({ firstName: null, address1: null, city: null, postCode: null }),
    ]);
    expect(row).toEqual(['', 'Honnold', 'a@cam.ac.uk', '', '', '', 'Student']);
  });

  it('sorts by surname then forename', () => {
    const rows = paidMemberRows([
      user({ firstName: 'Bea', lastName: 'Smith' }),
      user({ firstName: 'Cal', lastName: 'Adams' }),
      user({ firstName: 'Ann', lastName: 'Smith' }),
    ]);
    expect(rows.slice(1).map(r => `${r[0]} ${r[1]}`)).toEqual([
      'Cal Adams',
      'Ann Smith',
      'Bea Smith',
    ]);
  });
});
