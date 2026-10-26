import { Router, Request, Response } from 'express';
import { committeeAuth, userAuth } from '../middleware.js';
import {
  memberService,
  userService,
  signupService,
  meetService,
  britRockService,
} from '../../services/index.js';
import { logger } from '../../logger.js';
import { randomUUID } from 'node:crypto';
import {
  PayPalClient,
  isError,
  type PaymentContext,
  type PaymentError,
} from './paypalClient.js';
import {
  canCapturePayment,
  canVoidPayment,
  captureSignup,
  findExistingCapture,
  isFreeMeet,
  isSettledForCapture,
  needsNewPayment,
  PaymentStatus,
  voidSignup,
  type PaymentOutcome,
} from './committeePayments.js';
import type { SignupModel } from '../../database/database.js';

const router: Router = Router();

interface PaymentWorkflow {
  orderID: string;
  price: string;
  capture: boolean;
  ctx: PaymentContext;
  onSuccess: (captureID: string) => Promise<void>;
}

// Token is fetched lazily on first API call.
const paypalClient = new PayPalClient();

// ============================================================================
// Helper Functions
// ============================================================================

async function executePaymentWorkflow(
  workflow: PaymentWorkflow
): Promise<PaymentError | null> {
  const verifyResult = await paypalClient.verifyOrder(
    workflow.orderID,
    workflow.price
  );
  if (isError(verifyResult)) {
    return verifyResult;
  }

  const authResult = await paypalClient.authorizeOrder(
    workflow.orderID,
    workflow.ctx
  );
  if (isError(authResult)) {
    return authResult;
  }

  if (workflow.capture) {
    const captureResult = await paypalClient.captureAuthorization(
      authResult,
      workflow.price,
      workflow.ctx,
      // The authorization was created just above, so it identifies the attempt.
      `capture-${authResult}`
    );
    if (isError(captureResult)) {
      return captureResult;
    }
    // Money moved at this point. If the DB write below fails, the user
    // is charged but their membership / booking isn't recorded. Flag
    // loudly so the captureID is in the logs (and PaymentEvents) for
    // manual reconciliation.
    try {
      await workflow.onSuccess(captureResult);
    } catch (err) {
      logger.error('CRITICAL: capture succeeded but post-capture DB write failed', {
        captureID: captureResult,
        authID: authResult,
        ctx: workflow.ctx,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  } else {
    try {
      await workflow.onSuccess(authResult);
    } catch (err) {
      // No money has moved yet, but the authorisation holds the member's
      // funds for up to 29 days. Release it rather than leave it dangling.
      const voided = await paypalClient.voidAuthorization(
        authResult,
        workflow.ctx
      );
      const meetFull = err instanceof Error && err.message === 'MEET_FULL';
      logger[meetFull && !isError(voided) ? 'warn' : 'error'](
        isError(voided)
          ? 'CRITICAL: signup failed after authorization and the void failed'
          : 'Signup failed after authorization; authorization voided',
        {
          authID: authResult,
          ctx: workflow.ctx,
          error: err instanceof Error ? err.message : String(err),
        }
      );
      const released = isError(voided)
        ? 'Please contact the webmaster so they can release the hold on your payment.'
        : 'The hold on your payment has been released, so you have not been charged.';
      return {
        err: meetFull
          ? `Trip filled up while you were paying! ${released}`
          : `We couldn't save your signup. ${released}`,
      };
    }
  }

  return null;
}

/**
 * Saves a new signup, or the renewed payment on an existing one. The signup
 * is committed before anything else here, so nothing after it may throw:
 * executePaymentWorkflow would void the authorization the signup now holds.
 */
async function handleMeetSignup(
  user: { id: string; displayName: string },
  meet: any,
  answers: object,
  authID?: string
): Promise<void> {
  const { signup, replacedAuthID } = await signupService.register(
    {
      meetID: meet.id,
      answers,
      authID,
      captureID: authID ? undefined : PaymentStatus.NOT_PAYING,
    },
    user,
    { canReplacePayment: needsNewPayment }
  );

  if (meet.signupControl !== 'Everyone') {
    try {
      await memberService.upsert({ id: user.id, hasFree: false });
    } catch (err) {
      logger.error('Signup saved but could not use up free meet', {
        userID: user.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (replacedAuthID) {
    await releaseReplacedAuthorization(replacedAuthID, user.id, signup.id);
  }
}

/**
 * The member paid again because their old authorization could not be
 * captured. Release the old hold so they are not left with two.
 */
async function releaseReplacedAuthorization(
  authID: string,
  userID: string,
  signupID: number
): Promise<void> {
  try {
    const outcome = await voidSignup(paypalClient, authID, {
      intent: 'register',
      userID,
      performedBy: userID,
      signupID,
    });
    if (outcome.result === 'failed') {
      logger.error(
        'CRITICAL: member renewed payment but the old authorization could not be released',
        { authID, userID, signupID, issue: outcome.issue, store: outcome.store }
      );
    }
  } catch (err) {
    logger.error('CRITICAL: error releasing replaced authorization', {
      authID,
      userID,
      signupID,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * New signups must pass capacity and membership checks. A member who is
 * already signed up skips both: they only owe money again if their old
 * payment could not be taken, and may renew it even once signups close.
 */
async function checkMeetEligibility(
  userId: string,
  meetId: number,
  existing: SignupModel | null
): Promise<PaymentError | { meet: any; paymentRequired: boolean }> {
  const missingFields = await userService.getMissingProfileFields(userId);
  if (missingFields.length > 0) {
    return {
      err: 'You need to complete your profile to do that!',
      missingFields,
    };
  }

  const meet = await meetService.getById(meetId);
  if (!meet) return { err: 'Database error: Could not find meet' };

  if (existing) {
    const paymentRequired =
      !isFreeMeet(meet.price) && needsNewPayment(existing);
    if (meet.disabled && !paymentRequired) {
      return { err: 'Signups are closed, so you can no longer edit yours.' };
    }
    return { meet, paymentRequired };
  }

  if (meet.disabled) return { err: 'Signups are not open!' };

  const currentSignups = await signupService.getCountByMeetId(meetId);
  if (meet.maxSignups && currentSignups >= meet.maxSignups) {
    return { err: 'Sorry, this trip is now full!' };
  }

  const paymentRequired = await isPaymentNeeded(userId, meet);
  if (isError(paymentRequired)) return paymentRequired;

  return { meet, paymentRequired };
}

async function isPaymentNeeded(
  userId: string,
  meet: any
): Promise<boolean | PaymentError> {
  const member = await memberService.getById(userId);
  const isFree = isFreeMeet(meet.price);

  if (member?.hasPaid) {
    // Current member - always allowed to sign up
    return !isFree;
  }

  if (!member || member.hasFree) {
    // User not known to have gone on any meets, and also not a member
    if (meet.signupControl !== 'Members') {
      return !isFree;
    }
    return { err: 'You need to pay for membership to do that!' };
  }

  // Neither paid nor a free meet remaining
  if (meet.signupControl === 'Everyone') {
    return !isFree;
  }

  return { err: 'You need to pay for membership to do that!' };
}

// ============================================================================
// Route Handlers
// ============================================================================

// Capture-all / void-all split work into batches so each HTTP call stays
// well under reverse-proxy timeouts. The client loops until `done: true`,
// sending back the IDs it has already attempted (`excludeIDs`) so that rows
// which failed earlier in the same click are not retried by every batch.
const BATCH_SIZE = 10;

interface BatchRequest {
  /** One per committee click; part of the capture idempotency key. */
  attemptID: string;
  excludeIDs: Set<number>;
  targetAuthID?: string;
}

function parseBatchRequest(body: any): BatchRequest {
  const attemptID =
    typeof body.attemptID === 'string' &&
    /^[A-Za-z0-9-]{1,64}$/.test(body.attemptID)
      ? body.attemptID
      : randomUUID();
  const excludeIDs = new Set<number>(
    Array.isArray(body.excludeIDs)
      ? body.excludeIDs.map(Number).filter(Number.isInteger)
      : []
  );
  return { attemptID, excludeIDs, targetAuthID: body.authID };
}

async function runCommitteeBatch(
  signups: any[],
  batch: BatchRequest,
  eligible: (signup: any) => boolean,
  process: (signup: any) => Promise<PaymentOutcome>
) {
  const counts = { done: 0, recovered: 0, failed: 0 };
  const failures: { signupID: number; name: string; issue: string }[] = [];
  const notes: string[] = [];
  const processedIDs: number[] = [];
  let remaining = 0;

  // Sequential to avoid overwhelming PayPal.
  for (const signup of signups) {
    if (
      !eligible(signup) ||
      (batch.targetAuthID && batch.targetAuthID !== signup.authID) ||
      batch.excludeIDs.has(signup.id)
    ) {
      continue;
    }
    if (processedIDs.length >= BATCH_SIZE) {
      remaining++;
      continue;
    }
    processedIDs.push(signup.id);
    const name = signup.user?.firstName ?? `Signup ${signup.id}`;

    const outcome = await process(signup);
    try {
      await signupService.updatePayment(signup.id, outcome.store);
    } catch (dbErr) {
      // If money moved, the capture row is in PaymentEvents — recovery is
      // possible by looking up this signupID in that table.
      logger.error('CRITICAL: PayPal operation finished but Signup update failed', {
        signupID: signup.id,
        authID: signup.authID,
        outcome,
        error: dbErr instanceof Error ? dbErr.message : String(dbErr),
      });
      counts.failed++;
      failures.push({
        signupID: signup.id,
        name,
        issue: outcome.result === 'failed' ? outcome.issue : 'DB_WRITE_FAILED',
      });
      continue;
    }

    counts[outcome.result]++;
    if (outcome.result === 'failed') {
      failures.push({ signupID: signup.id, name, issue: outcome.issue });
      logger.error(`Failed PayPal operation on ${signup.authID}: ${outcome.issue}`);
    } else {
      logger.info(`PayPal ${outcome.result} for ${signup.authID} → ${outcome.store}`);
      if (outcome.result === 'done' && outcome.note) {
        notes.push(`${name}: ${outcome.note}`);
      }
    }
  }

  return {
    ...counts,
    remaining,
    done: remaining === 0,
    processedIDs,
    failures,
    notes,
  };
}

router.post('/membership', userAuth, async (req: Request, res: Response) => {
  try {
    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: process.env.MEMBERSHIP_PRICE || '0',
      capture: true,
      ctx: {
        intent: 'membership',
        userID: req.user!.id,
        performedBy: req.user!.id,
      },
      onSuccess: async captureID => {
        await memberService.upsert({
          id: req.user!.id,
          hasPaid: true,
          hasFree: false,
          paymentID: captureID,
        });
      },
    });

    if (error) {
      return res.json(error);
    }

    res.json(true);
  } catch (err: any) {
    logger.error('Membership payment error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

router.post('/britrock', async (req: Request, res: Response) => {
  try {
    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: process.env.BRITROCK_PRICE || '0',
      capture: true,
      ctx: { intent: 'britrock' },
      onSuccess: async () => {
        await britRockService.upsert(req.body.form);
      },
    });

    if (error) {
      return res.json(error);
    }

    res.json(true);
  } catch (err: any) {
    logger.error('BritRock payment error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

const signupUser = (req: Request) => ({
  id: req.user!.id.toString(),
  displayName: (req.user as any).displayName || '',
});

/**
 * POST /required: the signup form was submitted. Saves the signup (or the
 * edited answers on an existing one) and replies `true` if the member needs
 * to pay before their place is confirmed.
 */
export async function handleSignupForm(req: Request, res: Response) {
  try {
    const user = signupUser(req);
    const meetID = Number(req.body.meetID);
    const existing = await signupService.getForUser(meetID, user.id);

    const eligibility = await checkMeetEligibility(user.id, meetID, existing);
    if (isError(eligibility)) return res.json(eligibility);
    const { meet, paymentRequired } = eligibility;

    if (existing) {
      if (!meet.disabled) {
        await signupService.updateAnswers(existing.id, req.body.answers);
      }
      if (
        paymentRequired &&
        existing.authID &&
        existing.captureID !== PaymentStatus.EXPIRED
      ) {
        const captured = await findExistingCapture(
          paypalClient,
          existing.authID
        );
        if (isError(captured)) {
          logger.error('Could not check old authorization before renewal', {
            signupID: existing.id,
            authID: existing.authID,
            code: captured.code,
          });
          return res.json({
            err: "We couldn't check your previous payment with PayPal. Please try again in a few minutes.",
          });
        }
        if (captured) {
          await signupService.updatePayment(existing.id, captured);
          return res.json(false);
        }
      }
      return res.json(paymentRequired);
    }

    if (paymentRequired) return res.json(true);

    await handleMeetSignup(user, meet, req.body.answers);
    res.json(false);
  } catch (err: any) {
    if (err.message === 'MEET_FULL') {
      return res.json({ err: 'Sorry, this trip is now full!' });
    }
    if (err.message === 'ALREADY_SIGNED_UP') {
      return res.json({ err: 'You are already signed up to this trip.' });
    }
    logger.error('Payment required check error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
}

/**
 * POST /register: the member approved a PayPal payment for a new signup, or
 * to renew one whose old payment could not be taken.
 */
export async function handleSignupPayment(req: Request, res: Response) {
  try {
    const user = signupUser(req);
    const meetID = Number(req.body.form.meetID);
    const existing = await signupService.getForUser(meetID, user.id);

    const eligibility = await checkMeetEligibility(user.id, meetID, existing);
    if (isError(eligibility)) return res.json(eligibility);

    if (!eligibility.paymentRequired) {
      return res.json({
        err: existing
          ? "You've already paid for this trip, so you haven't been charged again."
          : 'You are not eligible to sign up to this meet! Please contact the webmaster.',
      });
    }

    const { meet } = eligibility;

    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: meet.price?.toString() || '0',
      capture: false,
      ctx: {
        intent: 'register',
        userID: user.id,
        performedBy: user.id,
      },
      // signupService.register re-checks capacity and any existing payment
      // under a row lock and throws; executePaymentWorkflow then voids the
      // new authorization.
      onSuccess: async authID => {
        await handleMeetSignup(user, meet, req.body.form.answers, authID);
      },
    });

    if (error) {
      return res.json(error);
    }

    res.json(true);
  } catch (err: any) {
    logger.error('Meet registration error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
}

router.post('/register', userAuth, handleSignupPayment);
router.post('/required', userAuth, handleSignupForm);

router.post('/capture', committeeAuth, async (req: Request, res: Response) => {
  try {
    const meet = await meetService.getById(req.body.id);
    if (!meet) return res.status(404).json({ err: 'Meet not found' });

    const signups = meet.signups || [];
    const price = meet.price?.toString() || '0';
    const batch = parseBatchRequest(req.body);

    const result = await runCommitteeBatch(
      signups,
      batch,
      canCapturePayment,
      signup =>
        captureSignup(paypalClient, signup.authID, price, {
          attemptID: batch.attemptID,
          ctx: {
            intent: 'register',
            userID: signup.userID?.toString(),
            performedBy: req.user!.id,
            signupID: signup.id,
          },
        })
    );

    const { done: captured, ...rest } = result;
    res.json({
      success: true,
      captured,
      skipped: signups.filter(isSettledForCapture).length,
      ...rest,
      done: result.remaining === 0,
    });
  } catch (err) {
    logger.error('Capture payments error:', err);
    res.status(500).json({ err: 'Encountered an error during processing.' });
  }
});

router.post('/void', committeeAuth, async (req: Request, res: Response) => {
  try {
    const meet = await meetService.getById(req.body.id);
    if (!meet) {
      return res.json({ err: 'Database error: Could not find meet' });
    }

    const signups = (meet as any).signups || [];
    const batch = parseBatchRequest(req.body);

    const result = await runCommitteeBatch(
      signups,
      batch,
      canVoidPayment,
      signup =>
        voidSignup(paypalClient, signup.authID, {
          intent: 'register',
          userID: signup.userID?.toString(),
          performedBy: req.user!.id,
          signupID: signup.id,
        })
    );

    const { done: voided, ...rest } = result;
    res.json({
      success: true,
      voided,
      skipped: signups.filter(
        (s: any) => s.captureID === PaymentStatus.VOID
      ).length,
      ...rest,
      done: result.remaining === 0,
    });
  } catch (err: any) {
    logger.error('Void payments error:', err);
    res.json({ err: 'Encountered an error. Please contact the webmaster' });
  }
});

export { executePaymentWorkflow };
export default router;
