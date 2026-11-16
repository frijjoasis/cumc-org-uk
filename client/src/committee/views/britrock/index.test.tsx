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

// Radix checkboxes measure themselves; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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
  showInSidebar: false,
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

const meets = [
  {
    id: 352,
    title: 'BritRock (members)',
    startDate: '2099-11-17T00:00:00.000Z',
    endDate: '2099-11-17T00:00:00.000Z',
    hidden: false,
  },
  {
    id: 353,
    title: 'Secret BritRock',
    startDate: '2099-11-18T00:00:00.000Z',
    endDate: '2099-11-18T00:00:00.000Z',
    hidden: true,
  },
  {
    id: 100,
    title: 'Old meet',
    startDate: '2020-01-01T00:00:00.000Z',
    endDate: '2020-01-01T00:00:00.000Z',
    hidden: false,
  },
];

const mockApi = (admin: object) =>
  vi.mocked(axios.get).mockImplementation(async (url: string) => ({
    data: url === '/api/meets/all' ? meets : admin,
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

  it('starts the guest price at £12', async () => {
    render(<BritRockManager />);
    expect(
      ((await screen.findByLabelText(/guest price/i)) as HTMLInputElement).value
    ).toBe('12.00');
  });

  it('creates the event as entered', async () => {
    render(<BritRockManager />);
    await screen.findByText('New BritRock Event');

    await userEvent.type(screen.getByLabelText('Title'), 'Brit Rock 2027');
    await userEvent.type(screen.getByLabelText('Location'), 'Divinity School');
    await userEvent.type(screen.getByLabelText(/date & time/i), '2027-11-16T19:30');
    await userEvent.clear(screen.getByLabelText(/guest price/i));
    await userEvent.type(screen.getByLabelText(/guest price/i), '13');
    await userEvent.selectOptions(screen.getByLabelText(/members' meet/i), '352');
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

  it('turns on the sidebar link', async () => {
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.click(screen.getByLabelText(/sidebar/i));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(postedBody()).toMatchObject({ showInSidebar: true });
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
      (screen.getByLabelText(/members' meet/i) as HTMLSelectElement).value
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
    expect(screen.getByLabelText(/sidebar/i).getAttribute('aria-checked')).toBe('false');
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

describe("BritRock committee page — members' meet", () => {
  const meetSelect = () =>
    screen.getByLabelText(/members' meet/i) as HTMLSelectElement;
  const optionLabels = () =>
    Array.from(meetSelect().options).map(o => o.textContent);

  it('offers meets that are not over, hidden ones included', async () => {
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    expect(optionLabels()).toEqual([
      'None - members only see the guest price',
      'BritRock (members)',
      'Secret BritRock (hidden)',
    ]);
  });

  it('links to the chosen meet for editing', async () => {
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    expect(
      screen.getByRole('link', { name: /edit meet/i }).getAttribute('href')
    ).toBe('/committee/meets/edit/352');
  });

  it('warns when tickets are on sale with no members meet', async () => {
    mockApi({ event: { ...event, memberMeetID: null }, tickets });
    render(<BritRockManager />);
    expect(
      await screen.findByText(/members will only see the guest price/i)
    ).toBeTruthy();

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'draft');
    expect(screen.queryByText(/members will only see the guest price/i)).toBeNull();
  });

  it('creates a members meet in the tab and selects it', async () => {
    mockApi({ event: { ...event, memberMeetID: null }, tickets });
    vi.mocked(axios.post).mockImplementation(async (url: string) => ({
      data:
        url === '/api/meets/new'
          ? {
              id: 400,
              title: 'Brit Rock Film Tour 2026 (members)',
              startDate: '2026-11-17T00:00:00.000Z',
              endDate: '2099-11-17T00:00:00.000Z',
              hidden: false,
            }
          : event,
    }));
    render(<BritRockManager />);
    await screen.findByLabelText('Title');

    await userEvent.click(screen.getByRole('button', { name: /create members' meet/i }));
    expect((screen.getByLabelText('Meet title') as HTMLInputElement).value).toBe(
      'Brit Rock Film Tour 2026 (members)'
    );
    const create = screen.getByRole('button', { name: /^create meet$/i });
    expect(create.hasAttribute('disabled')).toBe(true);

    await userEvent.type(screen.getByLabelText(/member price/i), '8');
    await userEvent.click(create);

    expect(axios.post).toHaveBeenCalledWith(
      '/api/meets/new',
      expect.objectContaining({
        title: 'Brit Rock Film Tour 2026 (members)',
        startDate: '2026-11-17',
        location: 'Divinity School',
        signupControl: 'Members',
        price: 8,
      })
    );
    expect(await screen.findByText(/picked it as the members' meet/i)).toBeTruthy();
    expect(meetSelect().value).toBe('400');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(axios.post).toHaveBeenLastCalledWith(
      '/api/britrock/admin/3',
      expect.objectContaining({ memberMeetID: '400' })
    );
  });

  it('needs a date and location before creating a meet', async () => {
    mockApi({ event: null, tickets: [] });
    render(<BritRockManager />);
    await screen.findByText('New BritRock Event');
    await userEvent.click(screen.getByRole('button', { name: /create members' meet/i }));
    expect(screen.getByText(/fill in the date and location above first/i)).toBeTruthy();
    await userEvent.type(screen.getByLabelText(/member price/i), '8');
    expect(
      screen.getByRole('button', { name: /^create meet$/i }).hasAttribute('disabled')
    ).toBe(true);
  });

  it('shows the error if the meet could not be created', async () => {
    mockApi({ event: { ...event, memberMeetID: null }, tickets });
    vi.mocked(axios.post).mockRejectedValue({
      response: { data: { err: 'Database error: Please contact the webmaster' } },
    });
    render(<BritRockManager />);
    await screen.findByLabelText('Title');
    await userEvent.click(screen.getByRole('button', { name: /create members' meet/i }));
    await userEvent.type(screen.getByLabelText(/member price/i), '8');
    await userEvent.click(screen.getByRole('button', { name: /^create meet$/i }));
    expect(
      await screen.findByText('Database error: Please contact the webmaster')
    ).toBeTruthy();
    expect(meetSelect().value).toBe('');
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
