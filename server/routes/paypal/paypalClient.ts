import axios from 'axios';
import { paymentEventService } from '../../services/index.js';
import type {
  PaymentEventRecord,
  PaymentIntent,
} from '../../services/paymentEventService.js';
import { logger } from '../../logger.js';

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

// Without a timeout a hung PayPal call hangs the request with it. A timed-out
// capture may still have gone through; that's safe because committee retries
// check the authorization's state at PayPal before capturing again.
const PAYPAL_TIMEOUT_MS = 15_000;

// ============================================================================
// Types
// ============================================================================

export interface PaymentError {
  err: string;
  /** PayPal's specific issue code, e.g. PAYER_CANNOT_PAY. */
  code?: string;
  missingFields?: string[];
}

export type PaymentResult<T> = T | PaymentError;

export function isError<T>(result: PaymentResult<T>): result is PaymentError {
  return (result as PaymentError).err !== undefined;
}

/**
 * Context attached to every PayPal operation so we can emit a traceable
 * PaymentEvent row. `intent` is the business-level operation; the rest
 * identifies who/what the operation is for.
 */
export interface PaymentContext {
  intent: PaymentIntent;
  userID?: string;
  performedBy?: string;
  signupID?: number;
}

export interface AuthorizationInfo {
  status: string;
  amount: string;
  orderID?: string;
  expirationTime?: string;
}

export interface PayPalErrorInfo {
  httpStatus?: number;
  name?: string;
  /**
   * The most specific code PayPal gave. PayPal v2 puts generic names like
   * UNPROCESSABLE_ENTITY in `name` and the real reason (PAYER_CANNOT_PAY,
   * AUTHORIZATION_ALREADY_CAPTURED, ...) in `details[0].issue`.
   */
  issue?: string;
  description?: string;
  debugId?: string;
}

export function parsePayPalError(err: unknown): PayPalErrorInfo {
  if (axios.isAxiosError(err)) {
    const data = (err.response?.data ?? {}) as {
      name?: string;
      message?: string;
      debug_id?: string;
      details?: { issue?: string; description?: string }[];
    };
    const detail = data.details?.[0];
    const timedOut =
      !err.response &&
      (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT');
    return {
      httpStatus: err.response?.status,
      name: data.name,
      issue: detail?.issue ?? data.name ?? (timedOut ? 'TIMEOUT' : undefined),
      description: detail?.description ?? data.message,
      debugId: data.debug_id,
    };
  }
  return { description: err instanceof Error ? err.message : String(err) };
}

// Messages shown to the member paying at checkout.
const MEMBER_MESSAGES: Record<string, string> = {
  INSTRUMENT_DECLINED:
    'Your bank or card issuer declined this payment. Please try again with a different card or payment method.',
  PAYER_CANNOT_PAY:
    "PayPal couldn't take this payment from your account. Please try again with a different payment method.",
  PAYER_ACCOUNT_LOCKED_OR_CLOSED:
    "Your PayPal account can't be used for this payment. Please try a different PayPal account or pay by card.",
  PAYER_ACTION_REQUIRED:
    'PayPal needs you to complete an extra step. Please try paying again.',
  TRANSACTION_REFUSED:
    'PayPal refused this transaction. Please try a different payment method, or contact the webmaster.',
  ORDER_NOT_APPROVED:
    "The payment wasn't approved in the PayPal window. Please try again.",
};

function memberMessage(issue: string | undefined, fallback: string): string {
  return (issue && MEMBER_MESSAGES[issue]) || fallback;
}

// ============================================================================
// PayPal Client
// ============================================================================

export class PayPalClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private async refreshAccessToken(): Promise<void> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(PAYPAL_OAUTH_API, params, {
      timeout: PAYPAL_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: {
        username: process.env.PAYPAL_ID || '',
        password: process.env.PAYPAL_SECRET || '',
      },
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
  }

  private async requestConfig(requestId?: string) {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.refreshAccessToken();
    }
    return {
      timeout: PAYPAL_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
      },
    };
  }

  async verifyOrder(
    orderID: string,
    expectedPrice: string
  ): Promise<PaymentResult<true>> {
    try {
      const { data } = await axios.get(
        `${PAYPAL_ORDER_API}${orderID}`,
        await this.requestConfig()
      );

      const actualPrice = parseFloat(data.purchase_units[0].amount.value);
      const expected = parseFloat(expectedPrice);

      if (Math.abs(actualPrice - expected) < 0.01) {
        return true;
      }
      return { err: 'Price mismatch detected.' };
    } catch (err) {
      this.logPayPalError('Verify order', { orderID }, err);
      return { err: 'Payment verification failed.' };
    }
  }

  async authorizeOrder(
    orderID: string,
    ctx?: PaymentContext
  ): Promise<PaymentResult<string>> {
    try {
      const response = await axios.post(
        `${PAYPAL_ORDER_API}${orderID}/authorize`,
        {},
        // Idempotency: an order can only be authorised once, so the
        // orderID identifies the attempt. A retry replays the prior result.
        await this.requestConfig(`authorize-${orderID}`)
      );
      const authID: string =
        response.data.purchase_units[0].payments.authorizations[0].id;
      await this.record(ctx, {
        operation: 'authorize',
        status: 'success',
        paypalReference: authID,
      });
      return authID;
    } catch (err) {
      const info = this.logPayPalError('Authorize order', { orderID }, err);
      await this.record(ctx, {
        operation: 'authorize',
        status: 'failure',
        paypalReference: orderID,
        ...eventErrorFields(info),
      });
      return {
        err: memberMessage(
          info.issue,
          'An error occurred authorising payment. This may be due to the transaction being declined by your bank. Please contact the webmaster for more information'
        ),
        code: info.issue,
      };
    }
  }

  /**
   * Capture `amount` against an authorization. `requestId` is the
   * idempotency key: reuse it only when retrying the *same* attempt (e.g.
   * after a timeout). A deliberate new attempt must use a new key, or PayPal
   * may replay the earlier result instead of trying again.
   */
  async captureAuthorization(
    authID: string,
    amount: string,
    ctx: PaymentContext | undefined,
    requestId: string
  ): Promise<PaymentResult<string>> {
    try {
      const response = await axios.post(
        `${PAYPAL_AUTHORIZATION_API}${authID}/capture`,
        {
          amount: { value: amount, currency_code: 'GBP' },
          // We only ever capture once per authorization. Marking it final
          // releases any uncaptured remainder back to the payer.
          final_capture: true,
        },
        await this.requestConfig(requestId)
      );
      const captureID: string = response.data.id;
      await this.record(ctx, {
        operation: 'capture',
        status: 'success',
        paypalReference: captureID,
        amount: parseFloat(amount),
        metadata: { authID },
      });
      return captureID;
    } catch (err) {
      const info = this.logPayPalError(
        'Capture authorization',
        { authID },
        err
      );
      await this.record(ctx, {
        operation: 'capture',
        status: 'failure',
        paypalReference: authID,
        amount: parseFloat(amount),
        ...eventErrorFields(info),
      });

      const messages: Record<string, string> = {
        AUTHORIZATION_ALREADY_CAPTURED:
          'This payment has already been captured.',
        AUTHORIZATION_VOIDED: 'Cannot capture a voided payment.',
        AUTHORIZATION_EXPIRED: 'Payment authorization has expired.',
      };
      return {
        err:
          (info.issue && messages[info.issue]) ||
          memberMessage(
            info.issue,
            'An error occurred capturing payment. You may have been charged. Please contact the webmaster'
          ),
        code: info.issue,
      };
    }
  }

  async voidAuthorization(
    authID: string,
    ctx?: PaymentContext
  ): Promise<PaymentResult<true>> {
    try {
      await axios.post(
        `${PAYPAL_AUTHORIZATION_API}${authID}/void`,
        {},
        // Idempotency: voiding is final, so every attempt means the same thing.
        await this.requestConfig(`void-${authID}`)
      );
      await this.record(ctx, {
        operation: 'void',
        status: 'success',
        paypalReference: authID,
      });
      return true;
    } catch (err) {
      const info = this.logPayPalError('Void authorization', { authID }, err);
      // Record the raw outcome. Callers *interpret* some failures as
      // success (e.g. already voided), but the audit log keeps the actual
      // PayPal response so disputes can be reconstructed.
      await this.record(ctx, {
        operation: 'void',
        status: 'failure',
        paypalReference: authID,
        ...eventErrorFields(info),
      });
      return {
        err: 'An error occurred voiding payment. Please contact the webmaster',
        code: info.issue,
      };
    }
  }

  async getAuthorization(
    authID: string
  ): Promise<PaymentResult<AuthorizationInfo>> {
    try {
      const { data } = await axios.get(
        `${PAYPAL_AUTHORIZATION_API}${authID}`,
        await this.requestConfig()
      );
      return {
        status: data.status,
        amount: data.amount?.value,
        orderID: data.supplementary_data?.related_ids?.order_id,
        expirationTime: data.expiration_time,
      };
    } catch (err) {
      const info = this.logPayPalError('Get authorization', { authID }, err);
      return { err: 'Could not look up authorization.', code: info.issue };
    }
  }

  /** The capture ID recorded against an order, or null if it has none. */
  async getOrderCaptureID(
    orderID: string
  ): Promise<PaymentResult<string | null>> {
    try {
      const { data } = await axios.get(
        `${PAYPAL_ORDER_API}${orderID}`,
        await this.requestConfig()
      );
      const captures: { id: string; status?: string }[] = (
        data.purchase_units ?? []
      ).flatMap(
        (unit: { payments?: { captures?: { id: string }[] } }) =>
          unit.payments?.captures ?? []
      );
      // Failed capture attempts (e.g. PAYER_CANNOT_PAY) stay on the order as
      // DECLINED captures, so only a completed or pending one counts.
      const live = captures.find(
        c => c.status === 'COMPLETED' || c.status === 'PENDING'
      );
      return live?.id ?? null;
    } catch (err) {
      const info = this.logPayPalError('Get order', { orderID }, err);
      return { err: 'Could not look up order.', code: info.issue };
    }
  }

  private async record(
    ctx: PaymentContext | undefined,
    event: Omit<
      PaymentEventRecord,
      'intent' | 'userID' | 'performedBy' | 'signupID'
    >
  ): Promise<void> {
    if (!ctx) return;
    await paymentEventService.record({
      intent: ctx.intent,
      userID: ctx.userID,
      performedBy: ctx.performedBy,
      signupID: ctx.signupID,
      ...event,
    });
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
  ): PayPalErrorInfo {
    const info = parsePayPalError(err);
    logger.error(`PayPal ${operation} error`, { ...context, ...info });
    return info;
  }
}

function eventErrorFields(info: PayPalErrorInfo) {
  return {
    errorCode: info.issue,
    errorMessage: info.description,
    debugId: info.debugId,
  };
}
