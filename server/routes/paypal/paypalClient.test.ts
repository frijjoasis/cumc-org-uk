import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: { ...actual.default, get: vi.fn(), post: vi.fn() },
  };
});
vi.mock('../../services/index.js', () => ({
  paymentEventService: { record: vi.fn() },
}));
vi.mock('../../logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const axios = (await import('axios')).default;
const { paymentEventService } = await import('../../services/index.js');
const { PayPalClient, parsePayPalError } = await import('./paypalClient.js');

// Shape copied from a real production failure in the exceptions log.
function paypalError(status: number, name: string, issue?: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, null, {
    status,
    data: {
      name,
      message: 'The requested action could not be performed.',
      debug_id: 'dbg-123',
      details: issue ? [{ issue, description: `${issue} description` }] : [],
    },
  } as AxiosResponse);
}

let client: InstanceType<typeof PayPalClient>;
const ctx = { intent: 'register' as const, signupID: 7 };

beforeEach(() => {
  vi.mocked(axios.get).mockReset();
  vi.mocked(axios.post).mockReset();
  vi.mocked(paymentEventService.record).mockReset();
  // Every client starts by fetching an OAuth token.
  vi.mocked(axios.post).mockImplementation(async (url: string) => {
    if (url.includes('/oauth2/token')) {
      return { data: { access_token: 'TOKEN', expires_in: 3600 } };
    }
    throw new Error(`unexpected POST ${url}`);
  });
  client = new PayPalClient();
});

function failNextPost(error: unknown) {
  const tokenImpl = vi.mocked(axios.post).getMockImplementation()!;
  vi.mocked(axios.post).mockImplementation(async (url: string, ...rest) => {
    if (url.includes('/oauth2/token')) return tokenImpl(url, ...rest);
    throw error;
  });
}

describe('parsePayPalError', () => {
  it('prefers details[0].issue over the generic name', () => {
    expect(
      parsePayPalError(
        paypalError(422, 'UNPROCESSABLE_ENTITY', 'PAYER_CANNOT_PAY')
      )
    ).toMatchObject({
      httpStatus: 422,
      name: 'UNPROCESSABLE_ENTITY',
      issue: 'PAYER_CANNOT_PAY',
      description: 'PAYER_CANNOT_PAY description',
      debugId: 'dbg-123',
    });
  });

  it('falls back to the name when there are no details', () => {
    expect(
      parsePayPalError(paypalError(500, 'INTERNAL_SERVER_ERROR')).issue
    ).toBe('INTERNAL_SERVER_ERROR');
  });

  it('reports TIMEOUT when PayPal never replied', () => {
    expect(
      parsePayPalError(
        new AxiosError('timeout of 15000ms exceeded', 'ECONNABORTED')
      ).issue
    ).toBe('TIMEOUT');
  });

  it('has no issue for non-PayPal errors', () => {
    expect(parsePayPalError(new Error('socket hang up'))).toEqual({
      description: 'socket hang up',
    });
  });
});

describe('captureAuthorization', () => {
  it('sends final_capture and the given idempotency key', async () => {
    vi.mocked(axios.post).mockImplementation(async (url: string) =>
      url.includes('/oauth2/token')
        ? { data: { access_token: 'TOKEN', expires_in: 3600 } }
        : { data: { id: 'CAPTURE-1' } }
    );

    expect(
      await client.captureAuthorization('AUTH-1', '20.00', ctx, 'key-1')
    ).toBe('CAPTURE-1');

    const [url, body, config] = vi.mocked(axios.post).mock.calls[1];
    expect(url).toMatch(/\/v2\/payments\/authorizations\/AUTH-1\/capture$/);
    expect(body).toEqual({
      amount: { value: '20.00', currency_code: 'GBP' },
      final_capture: true,
    });
    expect(config?.timeout).toBe(15_000);
    expect(config?.headers).toMatchObject({
      Authorization: 'Bearer TOKEN',
      'PayPal-Request-Id': 'key-1',
    });
  });

  it('returns the specific issue code and records it in the audit log', async () => {
    failNextPost(
      paypalError(422, 'UNPROCESSABLE_ENTITY', 'AUTHORIZATION_ALREADY_CAPTURED')
    );

    expect(
      await client.captureAuthorization('AUTH-1', '20.00', ctx, 'key-1')
    ).toEqual({
      err: 'This payment has already been captured.',
      code: 'AUTHORIZATION_ALREADY_CAPTURED',
    });
    expect(paymentEventService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'capture',
        status: 'failure',
        signupID: 7,
        errorCode: 'AUTHORIZATION_ALREADY_CAPTURED',
        debugId: 'dbg-123',
      })
    );
  });
});

describe('authorizeOrder', () => {
  it('gives the member a specific message when their card is declined', async () => {
    failNextPost(
      paypalError(422, 'UNPROCESSABLE_ENTITY', 'INSTRUMENT_DECLINED')
    );
    const result = await client.authorizeOrder('ORDER-1', ctx);
    expect(result).toMatchObject({ code: 'INSTRUMENT_DECLINED' });
    expect((result as { err: string }).err).toMatch(/declined/i);
  });
});

describe('voidAuthorization', () => {
  it('returns the 404 issue rather than pretending it worked', async () => {
    failNextPost(paypalError(404, 'RESOURCE_NOT_FOUND', 'INVALID_RESOURCE_ID'));
    expect(await client.voidAuthorization('AUTH-1', ctx)).toMatchObject({
      code: 'INVALID_RESOURCE_ID',
    });
  });
});

describe('lookups', () => {
  it('getAuthorization maps status, amount, order and expiry', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        status: 'CAPTURED',
        amount: { value: '34.10', currency_code: 'GBP' },
        expiration_time: '2026-11-01T00:00:00Z',
        supplementary_data: { related_ids: { order_id: 'ORDER-9' } },
      },
    });
    expect(await client.getAuthorization('AUTH-1')).toEqual({
      status: 'CAPTURED',
      amount: '34.10',
      orderID: 'ORDER-9',
      expirationTime: '2026-11-01T00:00:00Z',
    });
  });

  it('getOrderCaptureID prefers a completed capture', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        purchase_units: [
          {
            payments: {
              captures: [
                { id: 'CAP-DECLINED', status: 'DECLINED' },
                { id: 'CAP-OK', status: 'COMPLETED' },
              ],
            },
          },
        ],
      },
    });
    expect(await client.getOrderCaptureID('ORDER-9')).toBe('CAP-OK');
  });

  it('getOrderCaptureID returns null when nothing was captured', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { purchase_units: [{ payments: {} }] },
    });
    expect(await client.getOrderCaptureID('ORDER-9')).toBeNull();
  });
});
