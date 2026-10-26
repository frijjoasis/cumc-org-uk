import { describe, it, expect } from 'vitest';
import {
  canCapture,
  canVoid,
  describeIssue,
  describeState,
  getPaymentState,
} from './paymentStatus';

const state = (captureID?: string, authID = 'AUTH-1') =>
  getPaymentState({ authID, captureID });

describe('getPaymentState', () => {
  it.each([
    [undefined, { kind: 'authorized' }],
    ['Void', { kind: 'void' }],
    ['Expired', { kind: 'expired' }],
    ['Not Paying', { kind: 'free' }],
    ['Capture Failed', { kind: 'captureFailed', issue: undefined }],
    [
      'Capture Failed: PAYER_CANNOT_PAY',
      { kind: 'captureFailed', issue: 'PAYER_CANNOT_PAY' },
    ],
    [
      'Void Failed: INVALID_RESOURCE_ID',
      { kind: 'voidFailed', issue: 'INVALID_RESOURCE_ID' },
    ],
    ['5XY12345AB678901C', { kind: 'captured' }],
    ['Captured on PayPal', { kind: 'captured' }],
  ])('%s → %o', (captureID, expected) => {
    expect(state(captureID)).toEqual(expected);
  });

  it('is unpaid with no authorization', () => {
    expect(getPaymentState({ authID: undefined, captureID: undefined })).toEqual({
      kind: 'unpaid',
    });
  });
});

describe('actions', () => {
  it('allows capture and void only on open or failed authorizations', () => {
    expect(canCapture(state())).toBe(true);
    expect(canCapture(state('Capture Failed: PAYER_CANNOT_PAY'))).toBe(true);
    expect(canCapture(state('Void Failed'))).toBe(false);
    expect(canVoid(state('Void Failed'))).toBe(true);
    expect(canVoid(state('Expired'))).toBe(false);
    expect(canVoid(state('5XY12345AB678901C'))).toBe(false);
  });
});

describe('descriptions', () => {
  it('explains known PayPal issues', () => {
    expect(describeIssue('PAYER_ACCOUNT_LOCKED_OR_CLOSED')).toMatchObject({
      label: 'Payer account locked',
      retryable: false,
    });
  });

  it('treats legacy failures without a reason as unknown but retryable', () => {
    expect(describeIssue(undefined)).toMatchObject({
      label: 'Unknown error',
      retryable: true,
    });
  });

  it('still says something for issues it has never seen', () => {
    expect(describeIssue('SOME_NEW_THING').label).toBe('some new thing');
  });

  it('includes the reason in the CSV text', () => {
    expect(describeState(state('Capture Failed: PAYER_CANNOT_PAY'))).toBe(
      "Capture Failed (Payer can't pay)"
    );
  });
});
