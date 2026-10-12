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
  onError: (error: string) => void;
}

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
            Transaction failed. Please check your balance and try again.
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
              onError(response.data.err);
              setStatus('error');
            } else {
              setStatus('success');
              setTimeout(() => onSuccess(), 2000);
            }
          } catch {
            onError('Backend verification failed.');
            setStatus('error');
          }
        }}
        onError={err => {
          console.error('PayPal Script Error:', err);
          setStatus('error');
        }}
      />
    </div>
  );
};

export default PayPalButtons;
