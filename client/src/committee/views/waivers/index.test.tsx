/**
 * Tests for the committee meet waiver page: who is listed, and resetting.
 *
 * axios is mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Waivers from './index';

vi.mock('axios');

const users = [
  {
    id: '1',
    firstName: 'Alex',
    lastName: 'Used',
    displayName: 'Alex Used',
    email: 'au123@cam.ac.uk',
    college: 'Queens',
    member: { hasPaid: false },
  },
  {
    id: '2',
    firstName: null,
    lastName: null,
    displayName: 'Sam Display',
    email: 'sd456@cam.ac.uk',
    college: null,
    member: { hasPaid: false },
  },
  {
    id: '3',
    firstName: 'Jo',
    lastName: 'Paid',
    displayName: 'Jo Paid',
    email: 'jp789@cam.ac.uk',
    college: 'Kings',
    member: { hasPaid: true },
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <Waivers />
    </MemoryRouter>
  );

const row = async (name: string) =>
  (await screen.findByText(name)).closest('tr') as HTMLElement;

const search = (text: string) =>
  userEvent.type(screen.getByPlaceholderText(/search/i), text);

let confirmSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.mocked(axios.get).mockReset();
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.get).mockResolvedValue({ data: users });
  vi.mocked(axios.post).mockResolvedValue({ data: true });
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Waivers — listing', () => {
  it('lists unpaid users who have used their waiver', async () => {
    renderPage();
    expect(await screen.findByText('Alex Used')).toBeTruthy();
    expect(screen.getByText('Sam Display')).toBeTruthy();
    expect(axios.get).toHaveBeenCalledWith('/api/member/waivers');
  });

  it('hides paid members until searched for', async () => {
    renderPage();
    await screen.findByText('Alex Used');
    expect(screen.queryByText('Jo Paid')).toBeNull();

    await search('jo');
    expect(screen.getByText('Jo Paid')).toBeTruthy();
    expect(screen.queryByText('Alex Used')).toBeNull();
  });

  it('finds users by email', async () => {
    renderPage();
    await screen.findByText('Alex Used');
    await search('sd456');
    expect(screen.getByText('Sam Display')).toBeTruthy();
    expect(screen.queryByText('Alex Used')).toBeNull();
  });

  it('counts only used waivers, not paid members', async () => {
    renderPage();
    expect(await screen.findByText(/Used Waivers: 2/)).toBeTruthy();
  });

  it('shows an empty state when nobody has used a waiver', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    renderPage();
    expect(await screen.findByText('No used meet waivers.')).toBeTruthy();
  });

  it('shows an error when the list fails to load', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('network'));
    renderPage();
    expect(await screen.findByText('Could not load meet waivers.')).toBeTruthy();
  });
});

describe('Waivers — resetting', () => {
  it('does not offer a reset for paid members', async () => {
    renderPage();
    await screen.findByText('Alex Used');
    await search('jo');

    const paid = await row('Jo Paid');
    expect(within(paid).getByText('Paid member')).toBeTruthy();
    expect(within(paid).queryByRole('button', { name: /reset/i })).toBeNull();
  });

  it('resets a waiver and removes the user from the list', async () => {
    renderPage();
    const alex = await row('Alex Used');
    await userEvent.click(within(alex).getByRole('button', { name: /reset/i }));

    expect(axios.post).toHaveBeenCalledWith('/api/member/waivers/reset', {
      id: '1',
    });
    expect(
      await screen.findByText(/Alex Used can now attend one meet/)
    ).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Alex Used/ })).toBeNull();
    expect(screen.getByText(/Used Waivers: 1/)).toBeTruthy();
  });

  it('does nothing if the confirmation is cancelled', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    const alex = await row('Alex Used');
    await userEvent.click(within(alex).getByRole('button', { name: /reset/i }));

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByText('Alex Used')).toBeTruthy();
  });

  it('shows the server error and keeps the user listed', async () => {
    vi.mocked(axios.post).mockRejectedValue({
      response: { data: { err: 'Paid members do not need a meet waiver' } },
    });
    renderPage();
    const alex = await row('Alex Used');
    await userEvent.click(within(alex).getByRole('button', { name: /reset/i }));

    expect(
      await screen.findByText('Paid members do not need a meet waiver')
    ).toBeTruthy();
    expect(screen.getByText('Alex Used')).toBeTruthy();
  });
});
