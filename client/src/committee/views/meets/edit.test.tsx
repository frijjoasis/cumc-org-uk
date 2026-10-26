/**
 * Tests for the committee meet editor across its three modes:
 *   - /committee/meets/new        blank form, saves to /api/meets/new
 *   - /committee/meets/edit/:id   loads the meet, saves to /api/meets/edit/:id
 *   - /committee/meets/clone/:id  loads the source meet, saves a copy to /api/meets/new
 *
 * axios is mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import EditMeet from './edit';

vi.mock('axios');

// Radix checkboxes measure themselves; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const sourceMeet = {
  id: 7,
  title: 'Peak District',
  location: 'Stanage',
  startDate: '2026-11-07T00:00:00.000Z',
  endDate: '2026-11-08T00:00:00.000Z',
  type: 'Outdoor',
  signupControl: 'Default',
  disabled: false,
  hidden: false,
  price: 20,
  questions: [{ id: 1, title: 'Need a lift?' }],
  signups: [{ id: 1, displayName: 'Alex' }],
  signupCount: 1,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-02T00:00:00.000Z',
};

const LocationProbe = () => (
  <div data-testid="location">{useLocation().pathname}</div>
);

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/committee/meets/new" element={<EditMeet />} />
        <Route path="/committee/meets/clone/:id" element={<EditMeet />} />
        <Route path="/committee/meets/edit/:id" element={<EditMeet />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.mocked(axios.get).mockReset();
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.get).mockImplementation(async url =>
    url === `/api/meets/signups/${sourceMeet.id}`
      ? { data: sourceMeet }
      : { data: { ...sourceMeet, id: 99 } }
  );
  vi.mocked(axios.post).mockImplementation(async (_url, body: any) => ({
    data: { ...body, id: body.id ?? 99 },
  }));
});

afterEach(cleanup);

describe('EditMeet — clone', () => {
  it('loads the source meet instead of hanging on the loading screen', async () => {
    renderAt('/committee/meets/clone/7');

    expect(await screen.findByLabelText('Meet Title')).toHaveValue(
      'Peak District'
    );
    expect(screen.queryByText(/Loading Form/i)).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith('/api/meets/signups/7');
    expect(screen.getByText('Creating a copy of Peak District')).toBeVisible();
  });

  it('saves a new meet without the source id, signups or timestamps', async () => {
    renderAt('/committee/meets/clone/7');
    await userEvent.click(
      await screen.findByRole('button', { name: /Create Meet/i })
    );

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    const [url, body] = vi.mocked(axios.post).mock.calls[0] as [string, any];
    expect(url).toBe('/api/meets/new');
    expect(body.id).toBeUndefined();
    for (const key of ['signups', 'signupCount', 'createdAt', 'updatedAt']) {
      expect(body).not.toHaveProperty(key);
    }
    expect(body).toMatchObject({
      title: 'Peak District',
      location: 'Stanage',
      startDate: '2026-11-07',
      endDate: '2026-11-08',
      questions: sourceMeet.questions,
    });
  });

  it('moves to editing the copy and unlocks its questions once saved', async () => {
    renderAt('/committee/meets/clone/7');
    await userEvent.click(
      await screen.findByRole('button', { name: /Create Meet/i })
    );

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/committee/meets/edit/99'
      )
    );
    const questionsTab = screen.getByRole('tab', {
      name: /Signup Questions/i,
    });
    expect(questionsTab).toBeEnabled();
    expect(questionsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps questions locked until the copy is saved', async () => {
    renderAt('/committee/meets/clone/7');
    expect(
      await screen.findByRole('tab', { name: /Signup Questions/i })
    ).toBeDisabled();
  });

  it('shows an error rather than hanging if the source meet fails to load', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('network down'));
    renderAt('/committee/meets/clone/7');

    expect(
      await screen.findByText('Could not load meet data')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Loading Form/i)).not.toBeInTheDocument();
  });
});

describe('EditMeet — edit', () => {
  it('loads the meet and saves back to the same id', async () => {
    renderAt('/committee/meets/edit/7');
    await userEvent.click(
      await screen.findByRole('button', { name: /Update Details/i })
    );

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(vi.mocked(axios.post).mock.calls[0][0]).toBe('/api/meets/edit/7');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/committee/meets/edit/7'
    );
  });
});

describe('EditMeet — new', () => {
  it('shows a blank form without fetching anything', async () => {
    renderAt('/committee/meets/new');

    expect(screen.getByLabelText('Meet Title')).toHaveValue('');
    expect(screen.getByRole('button', { name: /Create Meet/i })).toBeDisabled();
    expect(axios.get).not.toHaveBeenCalled();
  });
});
