import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PayPalButtonsProps {
  description: string;
  price: string;
  payer?: any;
  intent: 'membership' | 'register' | 'britrock';
  form?: any;
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
  onError 
}: PayPalButtonsProps) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Prevent double-rendering in Strict Mode
    if (!paypalRef.current || paypalRef.current.innerHTML !== "") return;

    window.paypal
      .Buttons({
        style: {
          layout: 'horizontal',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: description,
              amount: { value: price },
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
            },
            payer: payer,
          });
        },
        onApprove: async (data: any, actions: any) => {
          setStatus('processing');
          try {
            // Map intents to endpoints
            const endpoint = `/api/paypal/${intent}`;
            const response = await axios.post(endpoint, { data, form });

            if (response.data.err) {
              onError(response.data.err);
              setStatus('error');
            } else {
              setStatus('success');
              setTimeout(() => onSuccess(), 2000);
            }
          } catch (err) {
            onError("Backend verification failed.");
            setStatus('error');
          }
        },
        onError: (err: any) => {
          console.error("PayPal Script Error:", err);
          setStatus('error');
        },
      })
      .render(paypalRef.current);
  }, [description, price, intent]); // Re-run if core payment details change

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
      <div ref={paypalRef} className="min-h-[45px]" />
    </div>
  );
};

export default PayPalButtons;