import type { BritRockEvent } from '@cumc/shared-types';

const pad = (n: number) => String(n).padStart(2, '0');

/** A date as a `<input type="datetime-local">` value, in the viewer's time. */
export function toLocalInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** e.g. "17 Nov 2026 @ 7:30pm" */
export function formatShowtime(date: Date | string): string {
  const d = new Date(date);
  const day = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d
    .toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(' ', '');
  return `${day} @ ${time}`;
}

export const formatPrice = (price: number) => `£${price.toFixed(2)}`;

/** e.g. "123-456". The server makes its own if this one is taken. */
export function newTicketCode(): string {
  const part = () => Math.floor(Math.random() * 900) + 100;
  return `${part()}-${part()}`;
}

/** Drafts never show, even to committee, so the sidebar matches the public's. */
export function showBritRockInSidebar(
  event: Pick<BritRockEvent, 'status' | 'showInSidebar'> | null
): boolean {
  return !!event && event.status !== 'draft' && event.showInSidebar;
}

export interface LinkableMeet {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  hidden: boolean;
}

/**
 * Meets committee can link as the members' signup: anything not yet over,
 * including hidden ones. Meet dates are stored as midnight UTC.
 */
export function linkableMeets(
  meets: LinkableMeet[],
  now = new Date()
): LinkableMeet[] {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  return meets
    .filter(m => new Date(m.endDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** A members-only social meet on the screening day, for /api/meets/new. */
export function memberMeetFor(
  event: { description: string; location: string; startsAt: string },
  title: string,
  price: number
) {
  // startsAt is a datetime-local value; meets only keep the date
  const day = event.startsAt.slice(0, 10);
  return {
    title,
    subtitle: 'Member tickets',
    desc: event.description,
    location: event.location,
    startDate: day,
    endDate: day,
    type: 'Social',
    signupControl: 'Members',
    disabled: false,
    hidden: false,
    questions: [],
    price,
    maxSignups: null,
  };
}
