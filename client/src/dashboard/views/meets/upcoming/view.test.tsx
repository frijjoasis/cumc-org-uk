/**
 * Tests for the public meet page. The server decides what each viewer may
 * see (see toPublicMeet in server/routes/meets/meets.ts); these check the
 * page uses it correctly.
 *
 * axios is mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ViewMeet from './view';

vi.mock('axios');

const user = { displayName: 'Alex Smith', email: 'alex@cam.ac.uk' } as any;

const publicMeet = {
  id: 7,
  title: 'Peak District',
  type: 'Outdoor',
  price: 20,
  disabled: false,
  maxSignups: 10,
  startDate: '2026-11-07T00:00:00.000Z',
  endDate: '2026-11-08T00:00:00.000Z',
  signupCount: 3,
};

const signedInMeet = {
  ...publicMeet,
  signups: [
    { displayName: 'Alex' },
    { displayName: 'Jo' },
    { displayName: 'Sam' },
  ],
  organiser: { firstName: 'Sam', lastName: 'Lead', phone: '07700900000' },
  mySignup: null as any,
};

const renderAs = (viewer: any, data: object) => {
  vi.mocked(axios.post).mockResolvedValue({ data });
  return render(
    <MemoryRouter initialEntries={['/meets/upcoming/view/7']}>
      <Routes>
        <Route
          path="/meets/upcoming/view/:id"
          element={<ViewMeet user={viewer} />}
        />
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => vi.mocked(axios.post).mockReset());
afterEach(cleanup);

describe('ViewMeet — logged out', () => {
  it('shows capacity from the count and asks them to sign in', async () => {
    renderAs(null, publicMeet);
    expect(await screen.findByText('3 / 10')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Register')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to view contact details')
    ).toBeInTheDocument();
    expect(screen.queryByText('Trip Manifest')).not.toBeInTheDocument();
  });
});

describe('ViewMeet — signed in', () => {
  it('lists who is going and shows the organiser contact', async () => {
    renderAs(user, signedInMeet);
    expect(await screen.findByText('Jo')).toBeInTheDocument();
    expect(screen.getByText(/Sam\s+Lead/)).toBeInTheDocument();
    expect(screen.getByText('07700900000')).toBeInTheDocument();
  });

  it('offers to sign up when they are not on the trip', async () => {
    renderAs(user, signedInMeet);
    expect(
      await screen.findByRole('link', { name: 'Sign Up for This Trip' })
    ).toBeInTheDocument();
  });

  it('offers to edit when they are already signed up, even if full', async () => {
    renderAs(user, {
      ...signedInMeet,
      signupCount: 10,
      mySignup: { answers: [], needsPayment: false },
    });
    expect(
      await screen.findByRole('link', { name: 'Edit Your Signup' })
    ).toHaveAttribute('href', '/meets/upcoming/register/7');
    expect(
      screen.queryByText(/payment didn't go through/i)
    ).not.toBeInTheDocument();
  });
});

describe('ViewMeet — payment needs renewing', () => {
  const needsPayment = {
    ...signedInMeet,
    mySignup: { answers: [], needsPayment: true },
  };

  it('tells them and offers to renew', async () => {
    renderAs(user, needsPayment);
    expect(
      await screen.findByText(/payment didn't go through/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Renew Payment' })
    ).toHaveAttribute('href', '/meets/upcoming/register/7');
  });

  it('still offers renewal after signups close', async () => {
    renderAs(user, { ...needsPayment, disabled: true });
    expect(
      await screen.findByRole('link', { name: 'Renew Payment' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });
});
