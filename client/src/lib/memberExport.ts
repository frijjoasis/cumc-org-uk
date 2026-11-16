import type { UserWithProfile } from '@cumc/shared-types';

export type MembershipType = 'Student' | 'Individual';

/**
 * There is no membership type on the profile, so this reads the free-text
 * "College / Dept" field. Anyone who isn't obviously a non-student (alumni,
 * staff, "none"...) is assumed to be a student, so staff who only entered a
 * department will come out as Student and need correcting by hand.
 */
const NON_STUDENT = /\b(alum\w*|staff|none|n\/a|external|retired|not a student)\b/i;

export function membershipType(college: string | null | undefined): MembershipType {
  return college && NON_STUDENT.test(college) ? 'Individual' : 'Student';
}

export const PAID_MEMBER_HEADERS = [
  'Forename',
  'Surname',
  'Email',
  'Address line 1',
  'Town',
  'Postcode',
  'Membership type',
];

export function paidMemberRows(users: UserWithProfile[]): string[][] {
  const rows = users
    .filter(u => u.member?.hasPaid)
    .map(u => [
      u.firstName ?? '',
      u.lastName ?? '',
      u.email,
      u.address1 ?? '',
      u.city ?? '',
      u.postCode ?? '',
      membershipType(u.college),
    ])
    .sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));

  return [PAID_MEMBER_HEADERS, ...rows];
}
