import type { SignupData } from '@/types/meet';

/**
 * Interprets Signup.captureID, which holds either a PayPal capture ID or a
 * status written by the server (see server/routes/paypal/committeePayments.ts).
 * Failures carry PayPal's reason: "Capture Failed: PAYER_CANNOT_PAY".
 */
export type PaymentState =
  | { kind: 'unpaid' }
  | { kind: 'authorized' }
  | { kind: 'captured' }
  | { kind: 'free' }
  | { kind: 'void' }
  | { kind: 'expired' }
  | { kind: 'captureFailed'; issue?: string }
  | { kind: 'voidFailed'; issue?: string };

export function getPaymentState(
  s: Pick<SignupData, 'authID' | 'captureID'>
): PaymentState {
  const id = s.captureID;
  if (!id) return s.authID ? { kind: 'authorized' } : { kind: 'unpaid' };
  if (id === 'Void') return { kind: 'void' };
  if (id === 'Expired') return { kind: 'expired' };
  if (id === 'Not Paying') return { kind: 'free' };
  const failure = id.match(/^(Capture|Void) Failed(?:: (\w+))?$/);
  if (failure) {
    return {
      kind: failure[1] === 'Capture' ? 'captureFailed' : 'voidFailed',
      issue: failure[2],
    };
  }
  return { kind: 'captured' };
}

export function canCapture(state: PaymentState): boolean {
  return state.kind === 'authorized' || state.kind === 'captureFailed';
}

export function canVoid(state: PaymentState): boolean {
  return canCapture(state) || state.kind === 'voidFailed';
}

export interface IssueDescription {
  /** Short label for badges. */
  label: string;
  /** What the committee should do about it. */
  action: string;
  /** Whether retrying from this page might work. */
  retryable: boolean;
}

const ISSUES: Record<string, IssueDescription> = {
  PAYER_CANNOT_PAY: {
    label: "Payer can't pay",
    action:
      "PayPal couldn't take the money from their account. Ask them to add funds or pay another way, then retry.",
    retryable: true,
  },
  PAYER_ACCOUNT_LOCKED_OR_CLOSED: {
    label: 'Payer account locked',
    action:
      'Their PayPal account is locked or closed, so retrying will not work. Ask them to pay another way and void this one.',
    retryable: false,
  },
  INSTRUMENT_DECLINED: {
    label: 'Card declined',
    action:
      'Their bank declined the payment. Ask them to pay another way, or retry once they have sorted it.',
    retryable: true,
  },
  TRANSACTION_REFUSED: {
    label: 'Refused by PayPal',
    action:
      'PayPal refused the transaction. Ask them to pay another way, or check the PayPal dashboard.',
    retryable: false,
  },
  AUTHORIZATION_DENIED: {
    label: 'Denied',
    action:
      'PayPal denied this authorisation. Ask them to pay another way.',
    retryable: false,
  },
  AUTHORIZATION_VOIDED: {
    label: 'Already voided',
    action: 'This payment was voided before it could be captured.',
    retryable: false,
  },
  AUTHORIZATION_EXPIRED: {
    label: 'Expired',
    action:
      'The authorisation expired (after 29 days), so it can no longer be captured. Ask them to pay another way.',
    retryable: false,
  },
  AUTHORIZATION_ALREADY_CAPTURED: {
    label: 'Already captured',
    action:
      'The money was already taken, so it could not be voided. Refund it in PayPal if needed.',
    retryable: false,
  },
  INVALID_RESOURCE_ID: {
    label: 'Not found on PayPal',
    action:
      "PayPal doesn't recognise this authorisation for the club's account. Check the PayPal dashboard before retrying.",
    retryable: false,
  },
  DB_WRITE_FAILED: {
    label: 'Not saved',
    action:
      'PayPal succeeded but the website could not save the result. Tell the webmaster.',
    retryable: false,
  },
};

export function describeIssue(issue?: string): IssueDescription {
  if (issue && ISSUES[issue]) return ISSUES[issue];
  if (!issue || issue === 'UNKNOWN') {
    return {
      label: 'Unknown error',
      action:
        'No reason was recorded (an older failure, or a network error). Retrying is safe: the site checks PayPal first.',
      retryable: true,
    };
  }
  return {
    label: issue.replaceAll('_', ' ').toLowerCase(),
    action: `PayPal returned ${issue}. Check the PayPal dashboard, or retry.`,
    retryable: true,
  };
}

/** One-line text for CSV exports and alerts. */
export function describeState(state: PaymentState): string {
  switch (state.kind) {
    case 'unpaid':
      return 'Unpaid';
    case 'authorized':
      return 'Authorized';
    case 'captured':
      return 'Captured';
    case 'free':
      return 'Free Entry';
    case 'void':
      return 'Void';
    case 'expired':
      return 'Expired';
    case 'captureFailed':
      return `Capture Failed (${describeIssue(state.issue).label})`;
    case 'voidFailed':
      return `Void Failed (${describeIssue(state.issue).label})`;
  }
}
