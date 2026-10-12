/**
 * Contract tests for PayPalButtons.
 *
 * These tests pin down the observable behaviour at the component boundary:
 *   - the exact payload passed to window.paypal (so any SDK migration preserves it)
 *   - the exact HTTP shape posted to /api/paypal/{intent}
 *   - the UI state transitions (idle -> processing -> success/error)
 *
 * window.paypal is mocked. No network, no real SDK. See docs/paypal-testing.md.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import axios from 'axios';
import PayPalButtons from './PayPalButtons';

vi.mock('axios');

type ButtonsConfig = {
  style: Record<string, string>;
  createOrder: (data: unknown, actions: unknown) => unknown;
  onApprove: (data: unknown, actions: unknown) => Promise<void>;
  onError: (err: unknown) => void;
};

const renderMock = vi.fn();

function getButtonsConfig(): ButtonsConfig {
  const call = vi.mocked((window as any).paypal.Buttons).mock.calls[0];
  if (!call) throw new Error('window.paypal.Buttons was not called');
  return call[0] as ButtonsConfig;
}

function makeOrderActions() {
  return { order: { create: vi.fn().mockResolvedValue('ORDER-XYZ') } };
}

const baseProps = {
  description: 'CUMC Full Membership',
  price: '30.00',
  intent: 'membership' as const,
  onSuccess: vi.fn(),
  onError: vi.fn(),
};

beforeEach(() => {
  renderMock.mockClear();
  (window as any).paypal = {
    Buttons: vi.fn(() => ({ render: renderMock })),
  };
  vi.mocked(axios.post).mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PayPalButtons — mount', () => {
  it('renders the PayPal button into the ref container', () => {
    render(<PayPalButtons {...baseProps} />);
    expect((window as any).paypal.Buttons).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
    // render() receives the actual DOM node
    expect(renderMock.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });

  it('uses the gold / horizontal / rect / pay style', () => {
    render(<PayPalButtons {...baseProps} />);
    expect(getButtonsConfig().style).toEqual({
      layout: 'horizontal',
      color: 'gold',
      shape: 'rect',
      label: 'pay',
    });
  });
});

describe('PayPalButtons — createOrder payload', () => {
  it('sends description, price, NO_SHIPPING, and payer', async () => {
    const payer = { email_address: 'test@cam.ac.uk' };
    render(<PayPalButtons {...baseProps} payer={payer} />);

    const actions = makeOrderActions();
    await getButtonsConfig().createOrder({}, actions);

    expect(actions.order.create).toHaveBeenCalledWith({
      purchase_units: [
        {
          description: 'CUMC Full Membership',
          amount: { value: '30.00' },
        },
      ],
      application_context: { shipping_preference: 'NO_SHIPPING' },
      payer,
    });
  });

  it('omits payer when prop not provided', async () => {
    render(<PayPalButtons {...baseProps} />);

    const actions = makeOrderActions();
    await getButtonsConfig().createOrder({}, actions);

    const callArg = actions.order.create.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.payer).toBeUndefined();
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
      await getButtonsConfig().onApprove(approveData, {});
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
      await getButtonsConfig().onApprove({ orderID: 'X' }, {});
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
      await getButtonsConfig().onApprove({ orderID: 'X' }, {});
    });

    expect(onError).toHaveBeenCalledWith('Price mismatch detected.');
    expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
  });

  it('calls onError and shows error state when the request throws', async () => {
    vi.mocked(axios.post).mockRejectedValue(new Error('Network down'));
    const onError = vi.fn();
    render(<PayPalButtons {...baseProps} onError={onError} />);

    await act(async () => {
      await getButtonsConfig().onApprove({ orderID: 'X' }, {});
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
      getButtonsConfig().onError(new Error('SDK bang'));
    });

    expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
    errSpy.mockRestore();
  });
});
