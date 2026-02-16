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
import axios, { AxiosError } from 'axios';

const router: Router = Router();

// ============================================================================
// Constants & Configuration
// ============================================================================

const PAYPAL_OAUTH_API = 'https://api.paypal.com/v1/oauth2/token/';
const PAYPAL_ORDER_API = 'https://api.paypal.com/v2/checkout/orders/';
const PAYPAL_AUTHORIZATION_API =
  'https://api.paypal.com/v2/payments/authorizations/';

// ============================================================================
// Types
// ============================================================================

interface PaymentError {
  err: string;
}

type PaymentResult<T> = T | PaymentError;

interface PaymentWorkflow {
  orderID: string;
  price: string;
  capture: boolean;
  onSuccess: (captureID: string) => Promise<void>;
}

interface SignupData {
  meetID: number;
  answers: object;
  [key: string]: any;
}

// ============================================================================
// PayPal Client
// ============================================================================

class PayPalClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async initialize(): Promise<void> {
    try {
      await this.refreshAccessToken();
      logger.info('PayPal API access token obtained.');
    } catch (err) {
      logger.error('PayPal API initialization error: ', err);
    }
  }

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

  async authorizeOrder(orderID: string): Promise<PaymentResult<string>> {
    try {
      await this.ensureValidToken();
      const response = await axios.post(
        `${PAYPAL_ORDER_API}${orderID}/authorize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data.purchase_units[0].payments.authorizations[0].id;
    } catch (err) {
      this.logPayPalError('Authorize order', err);
      return {
        err: 'An error occurred authorising payment. This may be due to the transaction being declined by your bank. Please contact the webmaster for more information',
      };
    }
  }

  async captureAuthorization(
    authID: string,
    price: string
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
          },
        }
      );
      return response.data.id;
    } catch (err) {
      this.logPayPalError('Capture authorization', err);

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

  async voidAuthorization(authID: string): Promise<PaymentResult<true>> {
    try {
      await this.ensureValidToken();
      await axios.post(
        `${PAYPAL_AUTHORIZATION_API}${authID}/void`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return true;
    } catch (err) {
      this.logPayPalError('Void authorization', err);

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

  private logPayPalError(operation: string, err: any): void {
    logger.error(`PayPal ${operation} error:`, err);
    if (axios.isAxiosError(err) && err.response?.data) {
      logger.error(
        'PayPal error details:',
        JSON.stringify(err.response.data, null, 2)
      );
    }
  }
}

// Initialize PayPal client
const paypalClient = new PayPalClient();
paypalClient.initialize();

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

  const authResult = await paypalClient.authorizeOrder(workflow.orderID);
  if (isError(authResult)) {
    return authResult;
  }

  if (workflow.capture) {
    const captureResult = await paypalClient.captureAuthorization(
      authResult,
      workflow.price
    );
    if (isError(captureResult)) {
      return captureResult;
    }
    await workflow.onSuccess(captureResult);
  } else {
    await workflow.onSuccess(authResult); // Passes Auth ID
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
  const missing = await userService.isProfileIncomplete(userId);
  if (missing) {
    return { err: 'You need to complete your profile to do that!' };
  }

  const meet = await meetService.getById(meetId);
  if (!meet) return { err: 'Database error: Could not find meet' };
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

router.post('/membership', userAuth, async (req: Request, res: Response) => {
  try {
    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: process.env.MEMBERSHIP_PRICE || '0',
      capture: true,
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
      onSuccess: async authID => {
        const finalCount = await signupService.getCountByMeetId(meet.id);
        if (meet.maxSignups && finalCount >= meet.maxSignups) {
          await paypalClient.voidAuthorization(authID);
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
    const errors: string[] = [];

    // Sequential to avoid overwhelming PayPal
    for (const signup of signups) {
      const shouldCapture =
        canCapturePayment(signup) &&
        (!targetAuthID || targetAuthID === signup.authID);

      if (shouldCapture) {
        const result = await paypalClient.captureAuthorization(
          signup.authID!,
          price
        );

        if (isError(result)) {
          failCount++;
          await signupService.updatePayment(signup.id, 'Capture Failed');
          errors.push(`${signup.user?.firstName}: ${result.err}`);
          logger.error(`Failed to capture ${signup.authID}: ${result.err}`);
        } else {
          successCount++;
          await signupService.updatePayment(signup.id, result);
          logger.info(`Successfully captured ${signup.authID} → ${result}`);
        }
      } else if (signup.captureID && signup.captureID !== 'Capture Failed') {
        skippedCount++;
      }
    }

    res.json({
      success: true,
      captured: successCount,
      failed: failCount,
      skipped: skippedCount,
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
    const errors: string[] = [];

    // Sequential
    for (const signup of signups) {
      const shouldVoid =
        canVoidPayment(signup) &&
        (!targetAuthID || targetAuthID === signup.authID);

      if (shouldVoid) {
        const result = await paypalClient.voidAuthorization(signup.authID!);

        if (isError(result)) {
          failCount++;
          await signupService.updatePayment(signup.id, 'Void Failed');
          errors.push(`${signup.user?.firstName}: ${result.err}`);
          logger.error(`Failed to void ${signup.authID}: ${result.err}`);
        } else {
          successCount++;
          await signupService.updatePayment(signup.id, 'Void');
          logger.info(`Successfully voided ${signup.authID}`);
        }
      } else if (signup.captureID === 'Void') {
        skippedCount++;
      }
    }

    res.json({
      success: true,
      voided: successCount,
      failed: failCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    logger.error('Void payments error:', err);
    res.json({ err: 'Encountered an error. Please contact the webmaster' });
  }
});

export default router;
