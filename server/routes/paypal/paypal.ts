import { Router, Request, Response } from 'express';
import { committeeAuth, userAuth } from '../middleware.js';
import {
  memberService,
  userService,
  signupService,
  meetService,
  britRockService,
  paymentEventService,
} from '../../services/index.js';
import type { PaymentIntent } from '../../services/paymentEventService.js';
import { logger } from '../../logger.js';
import axios, { AxiosError } from 'axios';

const router: Router = Router();

// ============================================================================
// Constants & Configuration
// ============================================================================

// Default to sandbox for safety: any environment that forgets to set
// NODE_ENV=production fails loudly against sandbox instead of charging real cards.
const isProduction = process.env.NODE_ENV === 'production';
const PAYPAL_API_BASE = isProduction
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

const PAYPAL_OAUTH_API = `${PAYPAL_API_BASE}/v1/oauth2/token/`;
const PAYPAL_ORDER_API = `${PAYPAL_API_BASE}/v2/checkout/orders/`;
const PAYPAL_AUTHORIZATION_API = `${PAYPAL_API_BASE}/v2/payments/authorizations/`;

// ============================================================================
// Types
// ============================================================================

interface PaymentError {
  err: string;
  missingFields?: string[];
}

type PaymentResult<T> = T | PaymentError;

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

/**
 * Context attached to every PayPal operation so we can emit a traceable
 * PaymentEvent row. `intent` is the business-level operation; the rest
 * identifies who/what the operation is for.
 */
interface PaymentContext {
  intent: PaymentIntent;
  userID?: string;
  performedBy?: string;
  signupID?: number;
}

function extractPayPalErrorDetails(err: unknown): {
  errorCode?: string;
  errorMessage?: string;
  debugId?: string;
} {
  if (axios.isAxiosError(err)) {
    const data = (err.response?.data ?? {}) as {
      name?: string;
      message?: string;
      debug_id?: string;
    };
    return {
      errorCode: data.name,
      errorMessage: data.message,
      debugId: data.debug_id,
    };
  }
  return {
    errorMessage: err instanceof Error ? err.message : String(err),
  };
}

// ============================================================================
// PayPal Client
// ============================================================================

class PayPalClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private async refreshAccessToken(): Promise<void> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(PAYPAL_OAUTH_API, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: {
        username: process.env.PAYPAL_ID || '',
        password: process.env.PAYPAL_SECRET || '',
      },
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.refreshAccessToken();
    }
  }

  async verifyOrder(
    orderID: string,
    expectedPrice: string
  ): Promise<PaymentResult<true>> {
    try {
      await this.ensureValidToken();
      const { data } = await axios.get(`${PAYPAL_ORDER_API}${orderID}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      const actualPrice = parseFloat(data.purchase_units[0].amount.value);
      const expected = parseFloat(expectedPrice);

      if (Math.abs(actualPrice - expected) < 0.01) {
        return true;
      }
      return { err: 'Price mismatch detected.' };
    } catch (err) {
      return { err: 'Payment verification failed.' };
    }
  }

  async authorizeOrder(
    orderID: string,
    ctx?: PaymentContext
  ): Promise<PaymentResult<string>> {
    try {
      await this.ensureValidToken();
      const response = await axios.post(
        `${PAYPAL_ORDER_API}${orderID}/authorize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            // Idempotency: PayPal guarantees the same orderID can only
            // produce one successful authorization. A retry with the same
            // key replays the prior response rather than double-authorising.
            'PayPal-Request-Id': `authorize-${orderID}`,
          },
        }
      );
      const authID: string =
        response.data.purchase_units[0].payments.authorizations[0].id;
      if (ctx) {
        await paymentEventService.record({
          operation: 'authorize',
          status: 'success',
          intent: ctx.intent,
          userID: ctx.userID,
          performedBy: ctx.performedBy,
          signupID: ctx.signupID,
          paypalReference: authID,
        });
      }
      return authID;
    } catch (err) {
      this.logPayPalError('Authorize order', { orderID }, err);
      if (ctx) {
        await paymentEventService.record({
          operation: 'authorize',
          status: 'failure',
          intent: ctx.intent,
          userID: ctx.userID,
          performedBy: ctx.performedBy,
          signupID: ctx.signupID,
          paypalReference: orderID,
          ...extractPayPalErrorDetails(err),
        });
      }
      return {
        err: 'An error occurred authorising payment. This may be due to the transaction being declined by your bank. Please contact the webmaster for more information',
      };
    }
  }

  async captureAuthorization(
    authID: string,
    price: string,
    ctx?: PaymentContext
  ): Promise<PaymentResult<string>> {
    try {
      await this.ensureValidToken();
      const response = await axios.post(
        `${PAYPAL_AUTHORIZATION_API}${authID}/capture`,
        {
          amount: {
            value: price,
            currency_code: 'GBP',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            // Idempotency: a double-clicked Capture button or a retry after
            // a 5xx replays the prior response rather than double-charging.
            'PayPal-Request-Id': `capture-${authID}`,
          },
        }
      );
      const captureID: string = response.data.id;
      if (ctx) {
        await paymentEventService.record({
          operation: 'capture',
          status: 'success',
          intent: ctx.intent,
          userID: ctx.userID,
          performedBy: ctx.performedBy,
          signupID: ctx.signupID,
          paypalReference: captureID,
          amount: parseFloat(price),
          metadata: { authID },
        });
      }
      return captureID;
    } catch (err) {
      this.logPayPalError('Capture authorization', { authID }, err);
      const details = extractPayPalErrorDetails(err);
      if (ctx) {
        await paymentEventService.record({
          operation: 'capture',
          status: 'failure',
          intent: ctx.intent,
          userID: ctx.userID,
          performedBy: ctx.performedBy,
          signupID: ctx.signupID,
          paypalReference: authID,
          amount: parseFloat(price),
          ...details,
        });
      }

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorName = err.response?.data?.name;

        // Authorization already captured
        if (status === 422 && errorName === 'AUTHORIZATION_ALREADY_CAPTURED') {
          logger.warn(`Authorization ${authID} was already captured`);
          return { err: 'This payment has already been captured.' };
        }

        // Authorization voided
        if (status === 422 && errorName === 'AUTHORIZATION_VOIDED') {
          logger.warn(`Authorization ${authID} was voided`);
          return { err: 'Cannot capture a voided payment.' };
        }

        // Authorization expired
        if (status === 422 && errorName === 'AUTHORIZATION_EXPIRED') {
          logger.warn(`Authorization ${authID} has expired`);
          return { err: 'Payment authorization has expired.' };
        }
      }

      return {
        err: 'An error occurred capturing payment. You may have been charged. Please contact the webmaster',
      };
    }
  }

  async voidAuthorization(
    authID: string,
    ctx?: PaymentContext
  ): Promise<PaymentResult<true>> {
    try {
      await this.ensureValidToken();
      await axios.post(
        `${PAYPAL_AUTHORIZATION_API}${authID}/void`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            // Idempotency: void-all retries, or committee re-clicking Void,
            // produce the same response rather than attempting to void twice.
            'PayPal-Request-Id': `void-${authID}`,
          },
        }
      );
      if (ctx) {
        await paymentEventService.record({
          operation: 'void',
          status: 'success',
          intent: ctx.intent,
          userID: ctx.userID,
          performedBy: ctx.performedBy,
          signupID: ctx.signupID,
          paypalReference: authID,
        });
      }
      return true;
    } catch (err) {
      this.logPayPalError('Void authorization', { authID }, err);
      const details = extractPayPalErrorDetails(err);
      // Record the raw outcome. The branches below *interpret* some
      // failures as success for the caller, but the audit log keeps the
      // actual PayPal response so disputes can be reconstructed.
      if (ctx) {
        await paymentEventService.record({
          operation: 'void',
          status: 'failure',
          intent: ctx.intent,
          userID: ctx.userID,
          performedBy: ctx.performedBy,
          signupID: ctx.signupID,
          paypalReference: authID,
          ...details,
        });
      }

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const errorName = err.response?.data?.name;

        // Authorization not found (404) or already voided/captured (422)
        if (status === 404) {
          logger.warn(
            `Authorization ${authID} not found - may already be voided`
          );
          return true;
        }

        if (status === 422 && errorName === 'AUTHORIZATION_VOIDED') {
          logger.warn(`Authorization ${authID} already voided`);
          return true;
        }

        if (status === 422 && errorName === 'AUTHORIZATION_ALREADY_CAPTURED') {
          logger.error(`Cannot void ${authID} - already captured`);
          return { err: 'Cannot void - payment already captured' };
        }

        if (status === 422 && errorName === 'AUTHORIZATION_EXPIRED') {
          logger.warn(`Authorization ${authID} expired - treating as voided`);
          return true; // Expired auth can't be captured, effectively voided
        }
      }

      return {
        err: 'An error occurred voiding payment. Please contact the webmaster',
      };
    }
  }

  // We deliberately log *every* PayPal failure — including ones that other
  // branches then treat as success (e.g. void of an already-voided auth).
  // Payment ops must stay traceable: better one noisy line than a silent miss.
  // But we log a compact summary, NOT the raw axios error — the raw object
  // drags in the TLS session, agent pool, and cached cert chain, which makes
  // the logs unreadable and hides the actual signal.
  private logPayPalError(
    operation: string,
    context: Record<string, string | undefined>,
    err: unknown
  ): void {
    if (axios.isAxiosError(err)) {
      const data = (err.response?.data ?? {}) as {
        name?: string;
        message?: string;
        debug_id?: string;
        details?: unknown;
      };
      logger.error(`PayPal ${operation} error`, {
        ...context,
        status: err.response?.status,
        paypalName: data.name,
        paypalMessage: data.message,
        debugId: data.debug_id,
        details: data.details,
      });
    } else {
      logger.error(`PayPal ${operation} error (non-axios)`, {
        ...context,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

// Token is fetched lazily on first API call via ensureValidToken().
const paypalClient = new PayPalClient();

// ============================================================================
// Helper Functions
// ============================================================================

function isError<T>(result: PaymentResult<T>): result is PaymentError {
  return (result as PaymentError).err !== undefined;
}

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
      workflow.ctx
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
      captureID: authID ? undefined : 'Not Paying',
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
): Promise<PaymentResult<boolean>> {
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

function canVoidPayment(signup: any): boolean {
  if (!signup.authID) return false;

  // Can void if no captureID, or if previous void/capture failed
  return (
    !signup.captureID ||
    signup.captureID === 'Void Failed' ||
    signup.captureID === 'Capture Failed'
  );
}

function canCapturePayment(signup: any): boolean {
  if (!signup.authID) return false;

  // Can capture if not already captured/voided
  return !signup.captureID || signup.captureID === 'Capture Failed';
}

// ============================================================================
// Route Handlers
// ============================================================================

// Capture-all / void-all split work into batches so each HTTP call stays
// well under reverse-proxy timeouts (Heroku's is 30s). The client loops
// until `done: true` is returned. The per-row DB write done inside the
// loop (captureID = 'Void' | 'Capture Failed' | real id) makes the whole
// thing resumable for free — subsequent batches skip already-processed rows.
const BATCH_SIZE = 10;

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
    const targetAuthID = req.body.authID;
    const price = meet.price?.toString() || '0';

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    let remainingCount = 0;
    const errors: string[] = [];

    // Sequential to avoid overwhelming PayPal.
    // Processes up to BATCH_SIZE eligible rows per request; the client
    // keeps calling until `done: true` is returned.
    for (const signup of signups) {
      const shouldCapture =
        canCapturePayment(signup) &&
        (!targetAuthID || targetAuthID === signup.authID);

      if (!shouldCapture) {
        if (signup.captureID && signup.captureID !== 'Capture Failed') {
          skippedCount++;
        }
        continue;
      }

      if (successCount + failCount >= BATCH_SIZE) {
        remainingCount++;
        continue;
      }

      {
        const result = await paypalClient.captureAuthorization(
          signup.authID!,
          price,
          {
            intent: 'register',
            userID: signup.userID?.toString(),
            performedBy: req.user!.id,
            signupID: signup.id,
          }
        );

        if (isError(result)) {
          failCount++;
          try {
            await signupService.updatePayment(signup.id, 'Capture Failed');
          } catch (dbErr) {
            logger.error('DB write failed after capture failure', {
              signupID: signup.id,
              authID: signup.authID,
              error: dbErr instanceof Error ? dbErr.message : String(dbErr),
            });
          }
          errors.push(`${signup.user?.firstName}: ${result.err}`);
          logger.error(`Failed to capture ${signup.authID}: ${result.err}`);
        } else {
          try {
            await signupService.updatePayment(signup.id, result);
            successCount++;
            logger.info(`Successfully captured ${signup.authID} → ${result}`);
          } catch (dbErr) {
            // Money moved but we couldn't save the captureID to Signups.
            // The capture row is in PaymentEvents — recovery is possible
            // by looking up this signupID in that table.
            failCount++;
            errors.push(
              `${signup.user?.firstName}: captured but failed to save (see logs; captureID ${result})`
            );
            logger.error(
              'CRITICAL: capture succeeded but Signup update failed',
              {
                signupID: signup.id,
                authID: signup.authID,
                captureID: result,
                error: dbErr instanceof Error ? dbErr.message : String(dbErr),
              }
            );
          }
        }
      }
    }

    res.json({
      success: true,
      captured: successCount,
      failed: failCount,
      skipped: skippedCount,
      remaining: remainingCount,
      done: remainingCount === 0,
      errors: errors.length > 0 ? errors : undefined,
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
    const targetAuthID = req.body.authID;

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    let remainingCount = 0;
    const errors: string[] = [];

    for (const signup of signups) {
      const shouldVoid =
        canVoidPayment(signup) &&
        (!targetAuthID || targetAuthID === signup.authID);

      if (!shouldVoid) {
        if (signup.captureID === 'Void') skippedCount++;
        continue;
      }

      if (successCount + failCount >= BATCH_SIZE) {
        remainingCount++;
        continue;
      }

      const result = await paypalClient.voidAuthorization(signup.authID!, {
        intent: 'register',
        userID: signup.userID?.toString(),
        performedBy: req.user!.id,
        signupID: signup.id,
      });

      if (isError(result)) {
        failCount++;
        try {
          await signupService.updatePayment(signup.id, 'Void Failed');
        } catch (dbErr) {
          logger.error('DB write failed after void failure', {
            signupID: signup.id,
            authID: signup.authID,
            error: dbErr instanceof Error ? dbErr.message : String(dbErr),
          });
        }
        errors.push(`${signup.user?.firstName}: ${result.err}`);
        logger.error(`Failed to void ${signup.authID}: ${result.err}`);
      } else {
        try {
          await signupService.updatePayment(signup.id, 'Void');
          successCount++;
          logger.info(`Successfully voided ${signup.authID}`);
        } catch (dbErr) {
          failCount++;
          errors.push(
            `${signup.user?.firstName}: voided at PayPal but DB mark failed (see logs)`
          );
          logger.error(
            'CRITICAL: void succeeded at PayPal but Signup update failed',
            {
              signupID: signup.id,
              authID: signup.authID,
              error: dbErr instanceof Error ? dbErr.message : String(dbErr),
            }
          );
        }
      }
    }

    res.json({
      success: true,
      voided: successCount,
      failed: failCount,
      skipped: skippedCount,
      remaining: remainingCount,
      done: remainingCount === 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    logger.error('Void payments error:', err);
    res.json({ err: 'Encountered an error. Please contact the webmaster' });
  }
});

export default router;
