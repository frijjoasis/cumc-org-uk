import type { BritRockStatus } from '@cumc/shared-types';
import type { BritRockEventInput } from '../../services/britRockService.js';

type Invalid = { err: string };

const STATUSES: BritRockStatus[] = ['draft', 'open', 'closed'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TICKET_CODE = /^[1-9]\d{2}-[1-9]\d{2}$/;

export const isInvalid = (r: object): r is Invalid => 'err' in r;

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Blank means "not set"; anything else must be a whole number above 0. */
function optionalCount(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function parseEventInput(body: any): BritRockEventInput | Invalid {
  const title = text(body?.title, 120);
  const location = text(body?.location, 200);
  const startsAt = new Date(body?.startsAt);
  const price = Math.round(Number(body?.price) * 100) / 100;
  const capacity = optionalCount(body?.capacity);
  const memberMeetID = optionalCount(body?.memberMeetID);
  const status = body?.status ?? 'draft';

  if (!title) return { err: 'Give the event a title.' };
  if (!location) return { err: 'Say where the screening is.' };
  if (!body?.startsAt || Number.isNaN(startsAt.getTime())) {
    return { err: 'Set a valid date and time.' };
  }
  if (!Number.isFinite(price) || price <= 0 || price > 1000) {
    return { err: 'Set a ticket price above £0.' };
  }
  if (capacity === undefined) {
    return { err: 'Capacity must be a whole number, or blank for no limit.' };
  }
  if (memberMeetID === undefined) {
    return { err: 'Member meet must be a meet ID, or blank.' };
  }
  if (!STATUSES.includes(status)) return { err: 'Unknown status.' };

  return {
    title,
    description: text(body?.description, 5000) || null,
    location,
    startsAt,
    price,
    capacity,
    memberMeetID,
    refundNote: text(body?.refundNote, 300) || null,
    status,
    showInSidebar: body?.showInSidebar === true,
  };
}

export function parseTicketBuyer(
  form: any
): { name: string; email: string } | Invalid {
  const name = text(form?.name, 100);
  const email = text(form?.email, 254);
  if (!name) return { err: 'Please enter the attendee name.' };
  if (!EMAIL.test(email)) return { err: 'Please enter a valid email address.' };
  return { name, email };
}

/**
 * The page puts a suggested code in the PayPal description so it appears on
 * the buyer's receipt. Only a well-formed code is kept.
 */
export function parseTicketCode(form: any): string | undefined {
  return typeof form?.ticket === 'string' && TICKET_CODE.test(form.ticket)
    ? form.ticket
    : undefined;
}
