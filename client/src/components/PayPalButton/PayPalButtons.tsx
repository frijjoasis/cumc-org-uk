import { useState } from 'react';
import axios from 'axios';
import {
  PayPalButtons as PayPalButtonsLib,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PayPalButtonsProps {
  description: string;
  price: string;
  payer?: { email_address?: string };
  intent: 'membership' | 'register' | 'britrock';
  form?: unknown;
  onSuccess: () => void;
  /** `code` is PayPal's issue code when PayPal declined, e.g. INSTRUMENT_DECLINED. */
  onError: (error: string, code?: string) => void;
}

type ErrorKind = 'declined' | 'rejected' | 'unconfirmed' | 'paypal';

// PayPal issue codes meaning the payer's bank or account said no.
const DECLINE_CODES = new Set([
  'INSTRUMENT_DECLINED',
  'PAYER_CANNOT_PAY',
  'PAYER_ACCOUNT_LOCKED_OR_CLOSED',
  'TRANSACTION_REFUSED',
]);

const ERROR_MESSAGES: Record<ErrorKind, { title: string; body: string }> = {
  declined: {
    title: 'Payment declined',
    body: 'Try again with a different card, or pay from your PayPal balance.',
  },
  rejected: {
    title: 'Payment not completed',
    body: 'See the message at the top of the page for why.',
  },
  unconfirmed: {
    title: "We couldn't confirm your payment",
    body: 'It may still have gone through, so please don\'t pay again. Refresh the page to check, or contact the webmaster.',
  },
  paypal: {
    title: 'PayPal ran into a problem',
    body: 'The payment was not completed. Please try again.',
  },
};

const PayPalButtons = ({
  description,
  price,
  intent,
  form,
  payer,
  onSuccess,
  onError,
}: PayPalButtonsProps) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [status, setStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle');
  const [errorKind, setErrorKind] = useState<ErrorKind>('rejected');

  const fail = (kind: ErrorKind) => {
    setErrorKind(kind);
    setStatus('error');
  };

  if (isRejected) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          PayPal failed to load. Disable any ad-blocker or privacy extension and
          refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-4 gap-3 bg-zinc-50 rounded-lg border border-zinc-200">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-bold text-zinc-600 uppercase text-xs tracking-widest">
          Loading PayPal…
        </span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <Alert className="border-emerald-500 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="font-bold">
          Payment successful! Finalizing your registration...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center p-4 gap-3 bg-zinc-50 rounded-lg border border-zinc-200">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-bold text-zinc-600 uppercase text-xs tracking-widest">
          Verifying Transaction...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{ERROR_MESSAGES[errorKind].title}.</strong>{' '}
            {ERROR_MESSAGES[errorKind].body}
          </AlertDescription>
        </Alert>
      )}
      <PayPalButtonsLib
        style={{
          layout: 'horizontal',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
        }}
        forceReRender={[description, price, intent, payer]}
        createOrder={(_data, actions) =>
          actions.order.create({
            intent: 'AUTHORIZE',
            purchase_units: [
              {
                description,
                amount: { value: price, currency_code: 'GBP' },
              },
            ],
            application_context: { shipping_preference: 'NO_SHIPPING' },
            ...(payer ? { payer } : {}),
          })
        }
        onApprove={async data => {
          setStatus('processing');
          try {
            const response = await axios.post(`/api/paypal/${intent}`, {
              data,
              form,
            });
            if (response.data.err) {
              const { err, code } = response.data;
              onError(err, code);
              fail(DECLINE_CODES.has(code) ? 'declined' : 'rejected');
            } else {
              setStatus('success');
              setTimeout(() => onSuccess(), 2000);
            }
          } catch {
            // The request may have died after PayPal took the money, so don't
            // invite a second payment.
            onError(
              "We couldn't confirm your payment with our server. Please don't pay again until you've checked."
            );
            fail('unconfirmed');
          }
        }}
        onError={err => {
          console.error('PayPal Script Error:', err);
          fail('paypal');
        }}
      />
    </div>
  );
};

export default PayPalButtons;
