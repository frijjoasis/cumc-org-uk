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
  isSettledForCapture,
  PaymentStatus,
  voidSignup,
  type PaymentOutcome,
} from './committeePayments.js';

const router: Router = Router();

interface PaymentWorkflow {
  orderID: string;
  price: string;
  capture: boolean;
  ctx: PaymentContext;
  onSuccess: (captureID: string) => Promise<void>;
}

interface SignupData {
  meetID: number;
  answers: object;
  [key: string]: any;
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
    // No capture yet — if onSuccess fails, no money has moved. The
    // authorisation will auto-expire; we don't need to void here.
    await workflow.onSuccess(authResult);
  }

  return null;
}

async function handleMeetSignup(
  userId: string,
  displayName: string,
  meetId: number,
  signupData: SignupData,
  authID?: string
): Promise<void> {
  await signupService.register(
    {
      ...signupData,
      authID,
      captureID: authID ? undefined : PaymentStatus.NOT_PAYING,
    },
    {
      id: userId.toString(),
      displayName,
    }
  );

  const meet = await meetService.getById(meetId);
  if (meet && meet.signupControl !== 'Everyone') {
    await memberService.upsert({
      id: userId,
      hasFree: false,
    });
  }
}

async function checkMeetEligibility(
  userId: string,
  meetId: number
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
  if (meet.disabled) return { err: 'Signups are not open!' };

  const currentSignups = await signupService.getCountByMeetId(meetId, {
    excludeUserID: userId,
  });
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
  const isFree = !meet.price || parseFloat(meet.price.toString()) < 0.01;

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

router.post('/register', userAuth, async (req: Request, res: Response) => {
  try {
    const eligibility = await checkMeetEligibility(
      req.user!.id,
      req.body.form.meetID
    );
    if (isError(eligibility)) return res.json(eligibility);

    if (!eligibility.paymentRequired) {
      return res.json({
        err: 'You are not eligible to sign up to this meet! Please contact the webmaster.',
      });
    }

    const { meet } = eligibility;

    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: meet.price?.toString() || '0',
      capture: false,
      ctx: {
        intent: 'register',
        userID: req.user!.id,
        performedBy: req.user!.id,
      },
      onSuccess: async authID => {
        const finalCount = await signupService.getCountByMeetId(meet.id, {
          excludeUserID: req.user!.id,
        });
        if (meet.maxSignups && finalCount >= meet.maxSignups) {
          await paypalClient.voidAuthorization(authID, {
            intent: 'register',
            userID: req.user!.id,
            performedBy: req.user!.id,
          });
          throw new Error('CAPACITY_REACHED');
        }
        await handleMeetSignup(
          req.user!.id,
          (req.user as any).displayName || '',
          meet.id,
          req.body.form,
          authID
        );
      },
    });

    if (error) {
      return res.json(error);
    }

    res.json(true);
  } catch (err: any) {
    if (err.message === 'CAPACITY_REACHED') {
      return res.json({
        err: 'Trip filled up while you were paying! Your transaction has been voided.',
      });
    }
    logger.error('Meet registration error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

router.post('/required', userAuth, async (req: Request, res: Response) => {
  try {
    const eligibility = await checkMeetEligibility(
      req.user!.id,
      req.body.meetID
    );

    if (isError(eligibility)) {
      return res.json(eligibility);
    }

    if (eligibility.paymentRequired) {
      return res.json(eligibility.paymentRequired);
    }

    await handleMeetSignup(
      req.user!.id,
      (req.user as any).displayName || '',
      eligibility.meet.id,
      req.body
    );

    res.json(false);
  } catch (err: any) {
    logger.error('Payment required check error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

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

export default router;
