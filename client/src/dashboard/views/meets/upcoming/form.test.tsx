/**
 * Tests for the member signup form: new signups, editing an existing signup,
 * and renewing a payment that could not be taken.
 *
 * axios and PayPalButtons are mocked. No network, no PayPal SDK.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import MeetForm from './form';

vi.mock('axios');
vi.mock('@/components/PayPalButton/PayPalButtons', () => ({
  default: (props: any) => (
    <div data-testid="paypal">{JSON.stringify(props.form)}</div>
  ),
}));

// Radix checkboxes measure themselves; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const user = { displayName: 'Alex Smith', email: 'alex@cam.ac.uk' } as any;

const baseMeet = {
  id: 7,
  title: 'Peak District',
  price: 20,
  disabled: false,
  questions: [
    { id: 1, title: 'Have a rope?', type: 'checkbox' },
    { id: 2, title: 'Dietary needs', type: 'text' },
  ],
};

let meet: any;
let requiredResponse: unknown;

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/meets/upcoming/register/7']}>
      <Routes>
        <Route
          path="/meets/upcoming/register/:id"
          element={<MeetForm user={user} />}
        />
        <Route path="/meets/upcoming/view/:id" element={<div>Meet page</div>} />
        <Route path="/404" element={<div>Not found</div>} />
      </Routes>
    </MemoryRouter>
  );

const submit = async (button: RegExp) => {
  await userEvent.click(await screen.findByLabelText(/I agree/i));
  await userEvent.click(screen.getByRole('button', { name: button }));
};

const postedAnswers = () =>
  (vi.mocked(axios.post).mock.calls.find(c => c[0] === '/api/paypal/required')?.[1] as any)
    ?.answers;

beforeEach(() => {
  meet = { ...baseMeet, mySignup: null };
  requiredResponse = true;
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.post).mockImplementation(async (url: string) =>
    url === '/api/meets/view'
      ? { data: meet }
      : { data: requiredResponse }
  );
});

afterEach(cleanup);

describe('MeetForm — answers', () => {
  it('records an unticked checkbox as false, not "on"', async () => {
    renderForm();
    await screen.findByLabelText('Have a rope?');
    await submit(/Complete Registration/i);

    await waitFor(() => expect(postedAnswers()).toBeDefined());
    expect(postedAnswers()).toEqual([
      { id: 1, value: 'false' },
      { id: 2, value: '' },
    ]);
  });

  it('records a ticked checkbox and typed answer', async () => {
    renderForm();
    await userEvent.click(await screen.findByLabelText('Have a rope?'));
    await userEvent.type(screen.getByLabelText('Dietary needs'), 'Vegan');
    await submit(/Complete Registration/i);

    await waitFor(() => expect(postedAnswers()).toBeDefined());
    expect(postedAnswers()).toEqual([
      { id: 1, value: 'true' },
      { id: 2, value: 'Vegan' },
    ]);
  });
});

describe('MeetForm — new signup', () => {
  it('shows PayPal when payment is needed', async () => {
    renderForm();
    await submit(/Complete Registration/i);
    expect(await screen.findByTestId('paypal')).toBeInTheDocument();
    expect(screen.queryByText(/previous payment/i)).not.toBeInTheDocument();
  });
});

describe('MeetForm — editing a signup', () => {
  beforeEach(() => {
    meet.mySignup = {
      answers: [
        { id: 1, value: 'true' },
        { id: 2, value: 'Vegan' },
      ],
      needsPayment: false,
    };
    requiredResponse = false;
  });

  it('pre-fills their previous answers', async () => {
    renderForm();
    expect(await screen.findByLabelText('Have a rope?')).toBeChecked();
    expect(screen.getByLabelText('Dietary needs')).toHaveValue('Vegan');
  });

  it('saves without asking for payment', async () => {
    renderForm();
    await submit(/Save Changes/i);
    expect(await screen.findByText('Meet page')).toBeInTheDocument();
    expect(screen.queryByTestId('paypal')).not.toBeInTheDocument();
  });

  it('is not available once signups close', async () => {
    meet.disabled = true;
    renderForm();
    expect(await screen.findByText('Not found')).toBeInTheDocument();
  });
});

describe('MeetForm — renewing a payment', () => {
  beforeEach(() => {
    meet.mySignup = {
      answers: [{ id: 2, value: 'Vegan' }],
      needsPayment: true,
    };
  });

  it('explains why they are paying again', async () => {
    renderForm();
    await submit(/Continue to Payment/i);
    expect(await screen.findByTestId('paypal')).toBeInTheDocument();
    expect(
      screen.getByText(/previous payment couldn't be taken/i)
    ).toBeInTheDocument();
  });

  it('still works after signups close, with answers locked', async () => {
    meet.disabled = true;
    renderForm();
    expect(await screen.findByLabelText('Dietary needs')).toBeDisabled();
    await submit(/Continue to Payment/i);
    expect(await screen.findByTestId('paypal')).toBeInTheDocument();
  });
});

describe('MeetForm — load failure', () => {
  it('shows the error instead of crashing', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { err: 'Database error: Could not find meet' },
    });
    renderForm();
    expect(
      await screen.findByText('Database error: Could not find meet')
    ).toBeInTheDocument();
  });
});
