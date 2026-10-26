/**
 * Tests for the committee meet page: how answers read, and deleting signups
 * that hold a payment.
 *
 * axios is mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import MeetView from './view';

vi.mock('axios');

const meet = {
  id: 7,
  title: 'Peak District',
  questions: [
    { id: 1, title: 'Have a rope?', type: 'checkbox', required: true },
    { id: 2, title: 'Have a rack?', type: 'checkbox', required: false },
    { id: 3, title: 'Dietary needs', type: 'text' },
  ],
  signups: [
    {
      id: 11,
      authID: 'AUTH-1',
      captureID: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      user: { firstName: 'Alex', lastName: 'Old', email: 'alex@cam.ac.uk' },
      // Saved before checkbox answers were fixed
      answers: [
        { id: 1, value: 'on' },
        { id: 2, value: 'on' },
        { id: 3, value: 'Vegan' },
      ],
    },
    {
      id: 12,
      authID: 'AUTH-2',
      captureID: 'CAPTURE-2',
      createdAt: '2026-10-02T00:00:00.000Z',
      user: { firstName: 'Jo', lastName: 'New', email: 'jo@cam.ac.uk' },
      answers: [
        { id: 1, value: 'true' },
        { id: 2, value: 'false' },
      ],
    },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/committee/meets/view/7']}>
      <Routes>
        <Route path="/committee/meets/view/:id" element={<MeetView />} />
      </Routes>
    </MemoryRouter>
  );

const row = async (name: RegExp) =>
  (await screen.findByText(name)).closest('tr') as HTMLElement;

let confirmSpy: ReturnType<typeof vi.spyOn>;
let alertSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.mocked(axios.get).mockReset();
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.get).mockResolvedValue({ data: meet });
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MeetView — answers', () => {
  it('reads old "on" answers as Yes only where the box had to be ticked', async () => {
    renderPage();
    const cells = within(await row(/Alex/)).getAllByRole('cell');
    expect(cells.map(c => c.textContent)).toEqual(
      expect.arrayContaining(['Yes', 'Unknown', 'Vegan'])
    );
  });

  it('reads current answers as Yes / No', async () => {
    renderPage();
    const cells = within(await row(/Jo/)).getAllByRole('cell');
    expect(cells.map(c => c.textContent)).toEqual(
      expect.arrayContaining(['Yes', 'No', '-'])
    );
  });
});

describe('MeetView — actions', () => {
  it('has no link to the reimbursement page that never existed', async () => {
    renderPage();
    await screen.findByText('Peak District');
    expect(screen.queryByText(/Reimburse Drivers/i)).not.toBeInTheDocument();
  });

  it('warns that deleting releases a held payment', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: true });
    renderPage();
    await userEvent.click(
      within(await row(/Alex/)).getByTitle('Delete signup')
    );

    expect(confirmSpy.mock.calls[0][0]).toMatch(/payment hold will be released/);
    expect(axios.post).toHaveBeenCalledWith('/api/meets/deleteSignup', {
      id: 11,
    });
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('does not mention a hold for a captured payment', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: true });
    renderPage();
    await userEvent.click(within(await row(/Jo/)).getByTitle('Delete signup'));
    expect(confirmSpy.mock.calls[0][0]).not.toMatch(/hold/);
  });

  it('shows the error and refreshes when the server keeps the signup', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { err: "Couldn't release this member's payment hold" },
    });
    renderPage();
    await userEvent.click(
      within(await row(/Alex/)).getByTitle('Delete signup')
    );

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Couldn't release/)
      )
    );
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('does nothing if the committee member cancels', async () => {
    confirmSpy.mockReturnValue(false);
    renderPage();
    await userEvent.click(
      within(await row(/Alex/)).getByTitle('Delete signup')
    );
    expect(axios.post).not.toHaveBeenCalled();
  });
});
