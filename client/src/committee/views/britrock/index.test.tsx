/**
 * Tests for the committee BritRock page: setting up and editing the event,
 * and the ticket list.
 *
 * axios is mocked. No network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import BritRockManager from './index';

vi.mock('axios');

const event = {
  id: 3,
  title: 'Brit Rock Film Tour 2026',
  description: 'Three films.',
  location: 'Divinity School',
  startsAt: new Date(2026, 10, 17, 19, 30).toISOString(),
  price: 12,
  capacity: 100,
  memberMeetID: 352,
  refundNote: 'No refunds.',
  status: 'open',
};

const tickets = [
  {
    id: 1,
    eventID: 3,
    ticket: '123-456',
    name: 'Lynn Hill',
    email: 'lynn@example.com',
    captureID: 'CAP-1',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 2,
    eventID: 3,
    ticket: '789-012',
    name: 'Alex Honnold',
    email: 'alex@example.com',
    captureID: 'CAP-2',
    createdAt: '2026-11-02T10:00:00.000Z',
  },
];

const meets = [{ id: 352, title: 'BritRock (members)' }];

const mockApi = (admin: object) =>
  vi.mocked(axios.get).mockImplementation(async (url: string) => ({
    data: url === '/api/meets/upcoming' ? meets : admin,
  }));

const postedBody = () => vi.mocked(axios.post).mock.calls[0][1] as any;

let confirmSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.mocked(axios.get).mockReset();
  vi.mocked(axios.post).mockReset();
  vi.mocked(axios.post).mockResolvedValue({ data: event });
  mockApi({ event, tickets });
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('BritRock committee page — no event yet', () => {
  beforeEach(() => mockApi({ event: null, tickets: [] }));

  it('offers to create one', async () => {
    render(<BritRockManager />);
    expect(await screen.findByText('New BritRock Event')).toBeTruthy();
    expect(screen.getByRole('button', { name: /create event/i })).toBeTruthy();
    expect(screen.queryByText('Guest Tickets')).toBeNull();
  });

  it('creates the event as entered', async () => {
    render(<BritRockManager />);
    await screen.findByText('New BritRock Event');

    await userEvent.type(screen.getByLabelText('Title'), 'Brit Rock 2027');
    await userEvent.type(screen.getByLabelText('Location'), 'Divinity School');
    await userEvent.type(screen.getByLabelText(/date & time/i), '2027-11-16T19:30');
    await userEvent.type(screen.getByLabelText(/guest price/i), '13');
    await userEvent.selectOptions(screen.getByLabelText(/member signup meet/i), '352');
    await userEvent.click(screen.getByRole('button', { name: /create event/i }));

    expect(axios.post).toHaveBeenCalledWith('/api/britrock/admin', expect.anything());
    expect(postedBody()).toMatchObject({
      title: 'Brit Rock 2027',
      location: 'Divinity School',
      startsAt: new Date('2027-11-16T19:30').toISOString(),
      price: '13',
      capacity: '',
      memberMeetID: '352',
      status: 'draft',
    });
    expect(await screen.findByText('BritRock event created.')).toBeTruthy();
  });
});

describe('BritRock committee page — editing', () => {
  it('fills the form with the current event', async () => {
    render(<BritRockManager />);
    expect(
      ((await screen.findByLabelText('Title')) as HTMLInputElement).value
    ).toBe('Brit Rock Film Tour 2026');
    expect((screen.getByLabelText(/date & time/i) as HTMLInputElement).value).toBe(
      '2026-11-17T19:30'
    );
    expect((screen.getByLabelText(/guest price/i) as HTMLInputElement).value).toBe(
      '12.00'
    );
    expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('open');
  });

  it('saves changes to the current event', async () => {
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'closed');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(axios.post).toHaveBeenCalledWith('/api/britrock/admin/3', expect.anything());
    expect(postedBody()).toMatchObject({ status: 'closed', price: '12.00' });
    expect(await screen.findByText('BritRock event saved.')).toBeTruthy();
  });

  it('shows the server error when saving fails', async () => {
    vi.mocked(axios.post).mockRejectedValue({
      response: { data: { err: 'Set a ticket price above £0.' } },
    });
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Set a ticket price above £0.')).toBeTruthy();
  });

  it('keeps a saved member meet that is no longer upcoming', async () => {
    mockApi({ event: { ...event, memberMeetID: 99 }, tickets });
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    expect(
      (screen.getByLabelText(/member signup meet/i) as HTMLSelectElement).value
    ).toBe('99');
  });

  it('starts next year as a draft copy of this one', async () => {
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.click(screen.getByRole('button', { name: /new event/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect((screen.getByLabelText('Location') as HTMLInputElement).value).toBe(
      'Divinity School'
    );
    expect((screen.getByLabelText(/date & time/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('draft');
    expect(screen.queryByText('Guest Tickets')).toBeNull();

    await userEvent.type(screen.getByLabelText(/date & time/i), '2027-11-16T19:30');
    await userEvent.click(screen.getByRole('button', { name: /create event/i }));
    expect(axios.post).toHaveBeenCalledWith('/api/britrock/admin', expect.anything());
  });

  it('can back out of starting a new event', async () => {
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.click(screen.getByRole('button', { name: /new event/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByText('Guest Tickets')).toBeTruthy();
    expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('open');
  });

  it('does nothing if new event is not confirmed', async () => {
    confirmSpy.mockReturnValue(false);
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.click(screen.getByRole('button', { name: /new event/i }));
    expect(screen.getByText('Guest Tickets')).toBeTruthy();
  });
});

describe('BritRock committee page — tickets', () => {
  it('lists tickets sold with a running total', async () => {
    render(<BritRockManager />);
    expect(await screen.findByText('#123-456')).toBeTruthy();
    expect(screen.getByText('Alex Honnold')).toBeTruthy();
    expect(screen.getByText(/2 of 100 sold/)).toBeTruthy();
    expect(screen.getByText(/£24\.00/)).toBeTruthy();
  });

  it('finds tickets by name, email or ticket ID', async () => {
    render(<BritRockManager />);
    await screen.findByText('#123-456');
    const search = screen.getByPlaceholderText(/search/i);

    await userEvent.type(search, '789');
    expect(screen.getByText('Alex Honnold')).toBeTruthy();
    expect(screen.queryByText('Lynn Hill')).toBeNull();

    await userEvent.clear(search);
    await userEvent.type(search, 'LYNN@');
    expect(screen.getByText('Lynn Hill')).toBeTruthy();
    expect(screen.queryByText('Alex Honnold')).toBeNull();
  });

  it('shows an empty state before any sales', async () => {
    mockApi({ event, tickets: [] });
    render(<BritRockManager />);
    expect(await screen.findByText('No guest tickets sold yet.')).toBeTruthy();
  });

  it('shows an error when loading fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('down'));
    render(<BritRockManager />);
    expect(await screen.findByText('Could not load BritRock.')).toBeTruthy();
  });
});
