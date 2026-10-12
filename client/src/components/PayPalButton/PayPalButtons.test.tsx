/**
 * Contract tests for PayPalButtons.
 *
 * These tests pin down the observable behaviour at the component boundary:
 *   - the exact payload passed to the PayPal SDK via createOrder
 *   - the exact HTTP shape posted to /api/paypal/{intent}
 *   - the UI state transitions (loading SDK -> idle -> processing -> success/error)
 *
 * @paypal/react-paypal-js is mocked. No network, no real SDK. See docs/paypal-testing.md.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import axios from 'axios';
import PayPalButtons from './PayPalButtons';

vi.mock('axios');

// Shared mutable state so the mock module and tests see the same thing.
const paypalState = {
  reducerState: { isPending: false, isRejected: false, isResolved: true },
  lastButtonsProps: null as any,
};

vi.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  usePayPalScriptReducer: () => [paypalState.reducerState],
  PayPalButtons: (props: any) => {
    paypalState.lastButtonsProps = props;
    return (
      <button
        type="button"
        data-testid="paypal-stub-button"
        onClick={async () => {
          const actions = {
            order: {
              create: vi.fn().mockResolvedValue('STUB-ORDER-ID'),
            },
          };
          await props.createOrder({}, actions);
          await props.onApprove({ orderID: 'STUB-ORDER-ID' }, {});
        }}
      />
    );
  },
}));

const baseProps = {
  description: 'CUMC Full Membership',
  price: '30.00',
  intent: 'membership' as const,
  onSuccess: vi.fn(),
  onError: vi.fn(),
};

beforeEach(() => {
  paypalState.reducerState = {
    isPending: false,
    isRejected: false,
    isResolved: true,
  };
  paypalState.lastButtonsProps = null;
  vi.mocked(axios.post).mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PayPalButtons — SDK loading state', () => {
  it('shows a loading indicator while the SDK script is pending', () => {
    paypalState.reducerState = {
      isPending: true,
      isRejected: false,
      isResolved: false,
    };
    render(<PayPalButtons {...baseProps} />);
    expect(screen.getByText(/Loading PayPal/i)).toBeInTheDocument();
    expect(screen.queryByTestId('paypal-stub-button')).not.toBeInTheDocument();
  });

  it('shows a visible error when the SDK fails to load', () => {
    paypalState.reducerState = {
      isPending: false,
      isRejected: true,
      isResolved: false,
    };
    render(<PayPalButtons {...baseProps} />);
    expect(screen.getByText(/PayPal failed to load/i)).toBeInTheDocument();
    expect(screen.queryByTestId('paypal-stub-button')).not.toBeInTheDocument();
  });

  it('renders the pay button once the SDK resolves', () => {
    render(<PayPalButtons {...baseProps} />);
    expect(screen.getByTestId('paypal-stub-button')).toBeInTheDocument();
  });
});

describe('PayPalButtons — button config', () => {
  it('uses the gold / horizontal / rect / pay style', () => {
    render(<PayPalButtons {...baseProps} />);
    expect(paypalState.lastButtonsProps.style).toEqual({
      layout: 'horizontal',
      color: 'gold',
      shape: 'rect',
      label: 'pay',
    });
  });

  it('reruns the button when description / price / intent / payer change', () => {
    const payer = { email_address: 'test@cam.ac.uk' };
    render(<PayPalButtons {...baseProps} payer={payer} />);
    expect(paypalState.lastButtonsProps.forceReRender).toEqual([
      'CUMC Full Membership',
      '30.00',
      'membership',
      payer,
    ]);
  });
});

describe('PayPalButtons — createOrder payload', () => {
  it('sends intent, description, price, GBP, NO_SHIPPING, and payer', async () => {
    const payer = { email_address: 'test@cam.ac.uk' };
    render(<PayPalButtons {...baseProps} payer={payer} />);

    const actions = {
      order: { create: vi.fn().mockResolvedValue('X') },
    };
    await paypalState.lastButtonsProps.createOrder({}, actions);

    expect(actions.order.create).toHaveBeenCalledWith({
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          description: 'CUMC Full Membership',
          amount: { value: '30.00', currency_code: 'GBP' },
        },
      ],
      application_context: { shipping_preference: 'NO_SHIPPING' },
      payer,
    });
  });

  it('omits payer when prop not provided', async () => {
    render(<PayPalButtons {...baseProps} />);

    const actions = {
      order: { create: vi.fn().mockResolvedValue('X') },
    };
    await paypalState.lastButtonsProps.createOrder({}, actions);

    const payload = actions.order.create.mock.calls[0][0];
    expect(payload.payer).toBeUndefined();
  });
});

describe('PayPalButtons — onApprove', () => {
  it.each([
    ['membership', '/api/paypal/membership'],
    ['register', '/api/paypal/register'],
    ['britrock', '/api/paypal/britrock'],
  ])('posts to the correct endpoint for intent=%s', async (intent, endpoint) => {
    vi.mocked(axios.post).mockResolvedValue({ data: true });
    render(
      <PayPalButtons
        {...baseProps}
        intent={intent as 'membership' | 'register' | 'britrock'}
        form={{ foo: 'bar' }}
      />
    );

    const approveData = { orderID: 'ORDER-123' };
    await act(async () => {
      await paypalState.lastButtonsProps.onApprove(approveData, {});
    });

    expect(axios.post).toHaveBeenCalledWith(endpoint, {
      data: approveData,
      form: { foo: 'bar' },
    });
  });

  it('transitions idle → processing → success and calls onSuccess after 2s', async () => {
    vi.useFakeTimers();
    vi.mocked(axios.post).mockResolvedValue({ data: true });
    const onSuccess = vi.fn();
    render(<PayPalButtons {...baseProps} onSuccess={onSuccess} />);

    await act(async () => {
      await paypalState.lastButtonsProps.onApprove({ orderID: 'X' }, {});
    });

    expect(screen.getByText(/Payment successful/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('calls onError and shows error state when backend returns {err}', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { err: 'Price mismatch detected.' },
    });
    const onError = vi.fn();
    render(<PayPalButtons {...baseProps} onError={onError} />);

    await act(async () => {
      await paypalState.lastButtonsProps.onApprove({ orderID: 'X' }, {});
    });

    expect(onError).toHaveBeenCalledWith('Price mismatch detected.');
    expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
  });

  it('calls onError and shows error state when the request throws', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Network down'));
    const onError = vi.fn();
    render(<PayPalButtons {...baseProps} onError={onError} />);

    await act(async () => {
      await paypalState.lastButtonsProps.onApprove({ orderID: 'X' }, {});
    });

    expect(onError).toHaveBeenCalledWith('Backend verification failed.');
    expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
  });
});

describe('PayPalButtons — PayPal SDK onError', () => {
  it('shows the error alert when the SDK itself errors', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<PayPalButtons {...baseProps} />);

    act(() => {
      paypalState.lastButtonsProps.onError(new Error('SDK bang'));
    });

    expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
    errSpy.mockRestore();
  });
});
