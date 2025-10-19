import { Router, Request, Response } from 'express';
import { committeeAuth, userAuth } from '../middleware';
import {
  memberService,
  userService,
  signupService,
  meetService,
  britRockService,
} from '../../services';
import { logger } from '../../logger';
import axios, { AxiosError } from 'axios';

const router = Router();

// ============================================================================
// Constants & Configuration
// ============================================================================

const PAYPAL_OAUTH_API = 'https://api.paypal.com/v1/oauth2/token/';
const PAYPAL_ORDER_API = 'https://api.paypal.com/v2/checkout/orders/';
const PAYPAL_AUTHORIZATION_API = 'https://api.paypal.com/v2/payments/authorizations/';

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
  onSuccess: (captureID: string) => Promise<void>;
}

interface SignupData {
  meetID: number;
  answers: object;
  [key: string]: any; // Allow additional properties
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
    const response = await axios.post(
      PAYPAL_OAUTH_API,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.PAYPAL_ID || '',
          password: process.env.PAYPAL_SECRET || '',
        },
        params: {
          grant_type: 'client_credentials',
        },
      }
    );

    this.accessToken = response.data.access_token;
    // Refresh token 5 minutes before expiry (default is usually 9 hours)
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.refreshAccessToken();
    }
  }

  async verifyOrder(orderID: string, expectedPrice: string): Promise<PaymentResult<true>> {
    try {
      await this.ensureValidToken();
      const response = await axios.get(`${PAYPAL_ORDER_API}${orderID}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const actualPrice = parseFloat(response.data.purchase_units[0].amount.value);
      const expected = parseFloat(expectedPrice);

      if (actualPrice === expected) {
        return true;
      } else {
        return {
          err: 'An error occurred verifying the amount paid. You have not been charged',
        };
      }
    } catch (err) {
      this.logPayPalError('Verify order', err);
      return { err: 'An error occurred verifying the payment. You have not been charged' };
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
      return { err: 'An error occurred voiding payment. Please contact the webmaster' };
    }
  }

  private logPayPalError(operation: string, err: any): void {
    logger.error(`PayPal ${operation} error:`, err);
    if (axios.isAxiosError(err) && err.response?.data) {
      logger.error('PayPal error details:', err.response.data.details);
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

async function executePaymentWorkflow(workflow: PaymentWorkflow): Promise<PaymentError | null> {
  const verifyResult = await paypalClient.verifyOrder(workflow.orderID, workflow.price);
  if (isError(verifyResult)) {
    return verifyResult;
  }

  const authResult = await paypalClient.authorizeOrder(workflow.orderID);
  if (isError(authResult)) {
    return authResult;
  }

  const captureResult = await paypalClient.captureAuthorization(authResult, workflow.price);
  if (isError(captureResult)) {
    return captureResult;
  }

  await workflow.onSuccess(captureResult);
  return null;
}

async function handleMeetSignup(
  userId: number,
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
    // Meet type causes loss of free waiver
    await memberService.upsert({
      id: userId,
      hasFree: false,
    });
  }
}

async function checkMeetEligibility(
  userId: number,
  meetId: number
): Promise<PaymentError | { meet: any; paymentRequired: boolean }> {
  const missing = await userService.isProfileIncomplete(userId);
  if (missing) {
    return { err: 'You need to complete your profile to do that!' };
  }

  const meet = await meetService.getById(meetId);
  if (!meet) {
    return { err: 'Database error: Could not find meet' };
  }

  if (meet.disabled) {
    return { err: 'Signups are not open for this meet!' };
  }

  const paymentRequired = await isPaymentNeeded(userId, meet);
  if (isError(paymentRequired)) {
    return paymentRequired;
  }

  return { meet, paymentRequired };
}

async function isPaymentNeeded(userId: number, meet: any): Promise<PaymentResult<boolean>> {
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

router.post('/membership', userAuth, async (req: Request, res: Response) => {
  try {
    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: process.env.MEMBERSHIP_PRICE || '0',
      onSuccess: async (captureID) => {
        await memberService.upsert({
          id: req.user.id,
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
    const eligibility = await checkMeetEligibility(req.user.id, req.body.form.meetID);

    if (isError(eligibility)) {
      return res.json(eligibility);
    }

    if (!eligibility.paymentRequired) {
      return res.json({
        err: 'You are not eligible to sign up to this meet! Please contact the webmaster.',
      });
    }

    const { meet } = eligibility;

    const error = await executePaymentWorkflow({
      orderID: req.body.data.orderID,
      price: meet.price?.toString() || '0',
      onSuccess: async (authID) => {
        await handleMeetSignup(
          req.user.id,
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
    logger.error('Meet registration error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

router.post('/required', userAuth, async (req: Request, res: Response) => {
  try {
    const eligibility = await checkMeetEligibility(req.user.id, req.body.meetID);

    if (isError(eligibility)) {
      return res.json(eligibility);
    }

    if (eligibility.paymentRequired) {
      return res.json(eligibility.paymentRequired);
    }

    // Payment not required - register directly
    await handleMeetSignup(
      req.user.id,
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
    if (!meet) {
      return res.json({ err: 'Database error: Could not find meet' });
    }

    const signups = (meet as any).signups || [];
    const targetAuthID = req.body.authID;

    const capturePromises = signups
      .filter(
        (signup: any) =>
          signup.authID &&
          !signup.captureID &&
          (!targetAuthID || targetAuthID === signup.authID)
      )
      .map(async (signup: any) => {
        const result = await paypalClient.captureAuthorization(
          signup.authID,
          meet.price?.toString() || '0'
        );

        const captureID = isError(result) ? 'Capture Failed' : result;
        await signupService.updatePayment(signup.id, captureID);
      });

    await Promise.all(capturePromises);
    res.json(true);
  } catch (err: any) {
    logger.error('Capture payments error:', err);
    res.json({ err: 'Encountered an error. Please contact the webmaster' });
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

    const voidPromises = signups
      .filter(
        (signup: any) =>
          signup.authID &&
          !signup.captureID &&
          (!targetAuthID || targetAuthID === signup.authID)
      )
      .map(async (signup: any) => {
        const result = await paypalClient.voidAuthorization(signup.authID);
        const status = isError(result) ? 'Void Failed' : 'Void';
        await signupService.updatePayment(signup.id, status);
      });

    await Promise.all(voidPromises);
    res.json(true);
  } catch (err: any) {
    logger.error('Void payments error:', err);
    res.json({ err: 'Encountered an error. Please contact the webmaster' });
  }
});

export default router;
