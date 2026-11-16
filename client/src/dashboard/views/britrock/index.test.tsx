/**
 * Tests for the public BritRock page: what it shows for each event status,
 * and that it only offers payment once there's something to buy.
 *
 * axios and the PayPal button are mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import BritRock from './index';

vi.mock('axios');
vi.mock('@/components/PayPalButton/PayPalButtons', () => ({
  default: (props: any) => (
    <button
      data-testid="paypal"
      data-price={props.price}
      onClick={() => props.onSuccess({ ticket: '123-456' })}
    >
      {JSON.stringify(props.form)}
    </button>
  ),
}));

const event = {
  id: 3,
  title: 'Brit Rock Film Tour 2026',
  description: 'Three superb films.',
  location: 'Divinity School',
  startsAt: '2026-11-17T19:30:00.000Z',
  price: 12,
  capacity: 100,
  memberMeetID: 352,
  refundNote: 'No refunds after 15 November.',
  status: 'open',
  remaining: 60,
  soldOut: false,
};

const renderPage = (data: object | null = event) => {
  vi.mocked(axios.get).mockResolvedValue({ data });
  return render(<BritRock />);
};

const fillDetails = async () => {
  await userEvent.type(screen.getByLabelText(/email/i), 'lynn@example.com');
  await userEvent.type(screen.getByLabelText(/attendee name/i), 'Lynn Hill');
};

beforeEach(() => vi.mocked(axios.get).mockReset());
afterEach(cleanup);

describe('BritRock page', () => {
  it('says nothing is on sale when there is no event', async () => {
    renderPage(null);
    expect(await screen.findByText(/no BritRock screening on sale/i)).toBeTruthy();
    expect(axios.get).toHaveBeenCalledWith('/api/britrock');
  });

  it('shows the event committee set up', async () => {
    renderPage();
    expect(await screen.findByText('Brit Rock Film Tour 2026')).toBeTruthy();
    expect(screen.getByText('Three superb films.')).toBeTruthy();
    expect(screen.getByText('Divinity School')).toBeTruthy();
    expect(screen.getByText('£12.00')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'here' }).getAttribute('href')
    ).toBe('/meets/upcoming/view/352');
  });

  it('asks for details before offering payment', async () => {
    renderPage();
    expect(await screen.findByText(/enter your name and email/i)).toBeTruthy();
    expect(screen.queryByTestId('paypal')).toBeNull();

    await fillDetails();
    const paypal = screen.getByTestId('paypal');
    expect(paypal.dataset.price).toBe('12.00');
    expect(JSON.parse(paypal.textContent!)).toEqual({
      name: 'Lynn Hill',
      email: 'lynn@example.com',
    });
  });

  it('shows the ticket code from the server after payment', async () => {
    renderPage();
    await screen.findByText('Brit Rock Film Tour 2026');
    await fillDetails();
    await userEvent.click(screen.getByTestId('paypal'));
    expect(await screen.findByText('#123-456')).toBeTruthy();
    expect(screen.getByText('No refunds after 15 November.')).toBeTruthy();
  });

  it('warns when few tickets are left', async () => {
    renderPage({ ...event, remaining: 5 });
    expect(await screen.findByText('Only 5 left')).toBeTruthy();
  });

  it.each([
    [{ soldOut: true, remaining: 0 }, /sold out/i],
    [{ status: 'closed' }, /sales have closed/i],
  ])('does not sell tickets when %o', async (change, message) => {
    renderPage({ ...event, ...change });
    expect(await screen.findByText(message)).toBeTruthy();
    await fillDetails();
    expect(screen.queryByTestId('paypal')).toBeNull();
  });

  it('marks a draft as a committee preview and takes no payment', async () => {
    renderPage({ ...event, status: 'draft' });
    expect(await screen.findByText('Draft preview')).toBeTruthy();
    await fillDetails();
    expect(screen.queryByTestId('paypal')).toBeNull();
  });
});
