import {
  isError,
  type PayPalClient,
  type PaymentContext,
  type PaymentResult,
} from './paypalClient.js';

/**
 * Values stored in Signup.captureID besides a real PayPal capture ID.
 * Failures are stored as `${CAPTURE_FAILED}: ${issue}` so the committee
 * page can say *why* (e.g. "Capture Failed: PAYER_CANNOT_PAY"). Rows
 * written before reasons were recorded are a bare "Capture Failed".
 */
export const PaymentStatus = {
  VOID: 'Void',
  EXPIRED: 'Expired',
  NOT_PAYING: 'Not Paying',
  CAPTURED_ON_PAYPAL: 'Captured on PayPal',
  CAPTURE_FAILED: 'Capture Failed',
  VOID_FAILED: 'Void Failed',
} as const;

export const captureFailed = (issue = 'UNKNOWN') =>
  `${PaymentStatus.CAPTURE_FAILED}: ${issue}`;
export const voidFailed = (issue = 'UNKNOWN') =>
  `${PaymentStatus.VOID_FAILED}: ${issue}`;

const isCaptureFailed = (captureID: string | null | undefined) =>
  !!captureID?.startsWith(PaymentStatus.CAPTURE_FAILED);
const isVoidFailed = (captureID: string | null | undefined) =>
  !!captureID?.startsWith(PaymentStatus.VOID_FAILED);

interface PaymentRow {
  authID?: string | null;
  captureID?: string | null;
}

export function canCapturePayment(signup: PaymentRow): boolean {
  if (!signup.authID) return false;
  return !signup.captureID || isCaptureFailed(signup.captureID);
}

export function canVoidPayment(signup: PaymentRow): boolean {
  if (!signup.authID) return false;
  return (
    !signup.captureID ||
    isCaptureFailed(signup.captureID) ||
    isVoidFailed(signup.captureID)
  );
}

/** Rows already settled, reported as "skipped" by bulk capture. */
export function isSettledForCapture(signup: PaymentRow): boolean {
  return !!signup.captureID && !isCaptureFailed(signup.captureID);
}

/**
 * Whether a member may pay again for a signup they already have: only when
 * the old authorization can no longer be captured. Any other state is a live
 * or settled payment, and replacing it would lose track of their money.
 */
export function needsNewPayment(signup: PaymentRow): boolean {
  return (
    isCaptureFailed(signup.captureID) ||
    signup.captureID === PaymentStatus.EXPIRED
  );
}

export function isFreeMeet(price: number | string | null | undefined) {
  return !price || parseFloat(price.toString()) < 0.01;
}

/**
 * A failed capture (e.g. one that timed out) may still have gone through.
 * Returns the capture ID to record if PayPal says the authorization was
 * captured, or null if it was not.
 */
export async function findExistingCapture(
  client: PayPalClient,
  authID: string
): Promise<PaymentResult<string | null>> {
  const auth = await client.getAuthorization(authID);
  if (isError(auth)) return auth;
  if (auth.status === 'CAPTURED' || auth.status === 'PARTIALLY_CAPTURED') {
    return resolveCaptureID(client, auth.orderID);
  }
  return null;
}

export type PaymentOutcome =
  | { result: 'done'; store: string; note?: string }
  /** PayPal had already captured it; we only fixed our record. */
  | { result: 'recovered'; store: string }
  | { result: 'failed'; store: string; issue: string };

const toPence = (value: string) => Math.round(parseFloat(value) * 100);

async function resolveCaptureID(
  client: PayPalClient,
  orderID: string | undefined
): Promise<string> {
  if (!orderID) return PaymentStatus.CAPTURED_ON_PAYPAL;
  const captureID = await client.getOrderCaptureID(orderID);
  if (isError(captureID) || !captureID) return PaymentStatus.CAPTURED_ON_PAYPAL;
  return captureID;
}

/**
 * Capture one signup's authorization. Checks the authorization's state at
 * PayPal first so that already-captured, voided, or expired authorizations
 * are recorded correctly instead of failing the same way on every retry.
 */
export async function captureSignup(
  client: PayPalClient,
  authID: string,
  meetPrice: string,
  opts: { attemptID: string; ctx: PaymentContext }
): Promise<PaymentOutcome> {
  const auth = await client.getAuthorization(authID);
  if (isError(auth)) {
    const issue = auth.code ?? 'UNKNOWN';
    return { result: 'failed', store: captureFailed(issue), issue };
  }

  const expired =
    auth.status === 'EXPIRED' ||
    (!!auth.expirationTime && Date.parse(auth.expirationTime) < Date.now());

  switch (auth.status) {
    case 'CAPTURED':
    case 'PARTIALLY_CAPTURED':
      return {
        result: 'recovered',
        store: await resolveCaptureID(client, auth.orderID),
      };
    case 'VOIDED':
      return {
        result: 'failed',
        store: PaymentStatus.VOID,
        issue: 'AUTHORIZATION_VOIDED',
      };
    case 'DENIED':
      return {
        result: 'failed',
        store: captureFailed('AUTHORIZATION_DENIED'),
        issue: 'AUTHORIZATION_DENIED',
      };
  }
  if (expired) {
    return {
      result: 'failed',
      store: PaymentStatus.EXPIRED,
      issue: 'AUTHORIZATION_EXPIRED',
    };
  }

  // Capture the meet price, but never more than was authorised: if the price
  // went up after signup, asking for more fails. Take what was authorised.
  let amount = meetPrice;
  let note: string | undefined;
  if (
    auth.amount &&
    (isNaN(toPence(meetPrice)) || toPence(meetPrice) > toPence(auth.amount))
  ) {
    amount = auth.amount;
    note = `captured £${auth.amount} (the amount they authorised), not the current price £${meetPrice}`;
  }
  amount = (toPence(amount) / 100).toFixed(2);

  const capture = await client.captureAuthorization(
    authID,
    amount,
    opts.ctx,
    `capture-${authID}-${opts.attemptID}`
  );
  if (!isError(capture)) return { result: 'done', store: capture, note };

  const issue = capture.code ?? 'UNKNOWN';
  switch (issue) {
    case 'AUTHORIZATION_ALREADY_CAPTURED':
      return {
        result: 'recovered',
        store: await resolveCaptureID(client, auth.orderID),
      };
    case 'AUTHORIZATION_VOIDED':
      return { result: 'failed', store: PaymentStatus.VOID, issue };
    case 'AUTHORIZATION_EXPIRED':
      return { result: 'failed', store: PaymentStatus.EXPIRED, issue };
    default:
      return { result: 'failed', store: captureFailed(issue), issue };
  }
}

/** Void one signup's authorization, interpreting PayPal's specific issue. */
export async function voidSignup(
  client: PayPalClient,
  authID: string,
  ctx: PaymentContext
): Promise<PaymentOutcome> {
  const res = await client.voidAuthorization(authID, ctx);
  if (!isError(res)) return { result: 'done', store: PaymentStatus.VOID };

  const issue = res.code ?? 'UNKNOWN';
  switch (issue) {
    case 'AUTHORIZATION_VOIDED':
      return { result: 'done', store: PaymentStatus.VOID };
    case 'AUTHORIZATION_EXPIRED':
      // The hold has already dropped off, which is all a void would do.
      return { result: 'done', store: PaymentStatus.EXPIRED };
    case 'AUTHORIZATION_ALREADY_CAPTURED': {
      // The money was taken, so record the capture rather than a failed void.
      const auth = await client.getAuthorization(authID);
      const orderID = isError(auth) ? undefined : auth.orderID;
      return {
        result: 'failed',
        store: await resolveCaptureID(client, orderID),
        issue,
      };
    }
    default:
      // Includes 404 INVALID_RESOURCE_ID: PayPal doesn't recognise this
      // authorization for our credentials, so we can't tell whether the
      // hold is gone. Never treat that as voided.
      return { result: 'failed', store: voidFailed(issue), issue };
  }
}
