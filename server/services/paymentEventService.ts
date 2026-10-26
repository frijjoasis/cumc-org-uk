import { PaymentEventModel } from '../database/database.js';
import { logger } from '../logger.js';

export type PaymentOperation = 'authorize' | 'capture' | 'void';
export type PaymentIntent = 'membership' | 'register' | 'britrock';

export interface PaymentEventRecord {
  operation: PaymentOperation;
  status: 'success' | 'failure';
  intent?: PaymentIntent;
  userID?: string;
  performedBy?: string;
  signupID?: number;
  paypalReference?: string;
  amount?: number;
  errorCode?: string;
  errorMessage?: string;
  debugId?: string;
  metadata?: object;
}

class PaymentEventService {
  /**
   * Append a row to the audit log. Never throws — audit failures must not
   * cascade into user-visible payment errors, so we swallow + warn.
   */
  async record(event: PaymentEventRecord): Promise<void> {
    try {
      await PaymentEventModel.create({
        operation: event.operation,
        status: event.status,
        intent: event.intent ?? null,
        userID: event.userID ?? null,
        performedBy: event.performedBy ?? null,
        signupID: event.signupID ?? null,
        paypalReference: event.paypalReference ?? null,
        amount: event.amount ?? null,
        errorCode: event.errorCode ?? null,
        errorMessage: event.errorMessage ?? null,
        debugId: event.debugId ?? null,
        metadata: event.metadata ?? null,
      });
    } catch (err) {
      logger.warn('Failed to write PaymentEvent — payment path unaffected', {
        err: err instanceof Error ? err.message : String(err),
        event,
      });
    }
  }
}

export const paymentEventService = new PaymentEventService();
