import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import {
  Film,
  Save,
  Search,
  Download,
  ExternalLink,
  CalendarPlus,
  TriangleAlert,
  CheckCircle2,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BritRock, BritRockEvent, BritRockStatus } from '@cumc/shared-types';
import { formatPrice, toLocalInput } from '@/lib/britrock';

interface UpcomingMeet {
  id: number;
  title: string;
}

type EventForm = Record<
  | 'title'
  | 'description'
  | 'location'
  | 'startsAt'
  | 'price'
  | 'capacity'
  | 'memberMeetID'
  | 'refundNote',
  string
> & { status: BritRockStatus; showInSidebar: boolean };

const EMPTY_FORM: EventForm = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  price: '12.00',
  capacity: '',
  memberMeetID: '',
  refundNote: '',
  status: 'draft',
  showInSidebar: false,
};

const STATUS_LABELS: Record<BritRockStatus, string> = {
  draft: 'Draft (hidden)',
  open: 'On sale',
  closed: 'Sales closed',
};

const STATUS_BADGES: Record<BritRockStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-amber-50 text-amber-700 border-amber-200',
};

const toForm = (e: BritRockEvent): EventForm => ({
  title: e.title,
  description: e.description ?? '',
  location: e.location,
  startsAt: toLocalInput(e.startsAt),
  price: e.price.toFixed(2),
  capacity: e.capacity?.toString() ?? '',
  memberMeetID: e.memberMeetID?.toString() ?? '',
  refundNote: e.refundNote ?? '',
  status: e.status,
  showInSidebar: e.showInSidebar,
});

const fieldLabel =
  'text-[10px] font-black uppercase tracking-widest text-zinc-400';
const selectClass =
  'h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm';

const BritRockManager = () => {
  const [event, setEvent] = useState<BritRockEvent | null>(null);
  const [tickets, setTickets] = useState<BritRock[]>([]);
  const [meets, setMeets] = useState<UpcomingMeet[]>([]);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  // True while setting up a new event rather than editing the current one
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    err: string | null;
    success: string | null;
  }>({ err: null, success: null });

  const load = () =>
    axios
      .get('/api/britrock/admin')
      .then(res => {
        setEvent(res.data.event);
        setTickets(res.data.tickets);
        setForm(res.data.event ? toForm(res.data.event) : EMPTY_FORM);
        setCreating(!res.data.event);
      })
      .catch(() => setStatus({ err: 'Could not load BritRock.', success: null }))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    axios
      .get('/api/meets/upcoming')
      .then(res => setMeets(res.data))
      .catch(() => setMeets([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
      };
      const url = creating ? '/api/britrock/admin' : `/api/britrock/admin/${event!.id}`;
      await axios.post(url, body);
      setStatus({
        err: null,
        success: creating ? 'BritRock event created.' : 'BritRock event saved.',
      });
      await load();
    } catch (err: any) {
      setStatus({
        err: err.response?.data?.err || 'Failed to save the event.',
        success: null,
      });
    } finally {
      setSaving(false);
    }
  };

  const startNewEvent = () => {
    if (
      !window.confirm(
        "Set up a new BritRock event? The current one and its ticket list will be replaced on this page and on the public page once you save."
      )
    )
      return;
    setForm({
      ...toForm(event!),
      startsAt: '',
      status: 'draft',
      showInSidebar: false,
    });
    setCreating(true);
    setStatus({ err: null, success: null });
  };

  const cancelNewEvent = () => {
    setForm(toForm(event!));
    setCreating(false);
  };

  const searchStr = filter.trim().toLowerCase();
  const filteredTickets = tickets.filter(
    t =>
      t.name.toLowerCase().includes(searchStr) ||
      t.email.toLowerCase().includes(searchStr) ||
      t.ticket.includes(searchStr)
  );

  const csvData = [
    ['Ticket', 'Name', 'Email', 'Bought', 'PayPal capture'],
    ...tickets.map(t => [
      t.ticket,
      t.name,
      t.email,
      t.createdAt ? new Date(t.createdAt).toISOString() : '',
      t.captureID ?? '',
    ]),
  ];

  if (loading) {
    return (
      <div className="p-12 text-center font-black italic text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {status.err && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription className="font-bold">{status.err}</AlertDescription>
        </Alert>
      )}
      {status.success && (
        <Alert className="border-emerald-500 text-emerald-700 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="font-bold">
            {status.success}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Film className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3">
                  {creating ? 'New BritRock Event' : 'BritRock'}
                  {event && !creating && (
                    <Badge
                      variant="outline"
                      className={`not-italic normal-case tracking-normal rounded-full ${STATUS_BADGES[event.status]}`}
                    >
                      {STATUS_LABELS[event.status]}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                  Set up the guest ticket page at /britrock. Keep it as a draft
                  while you get it ready (committee can still preview it), set
                  it on sale when tickets should go live, and close sales
                  afterwards.
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {event && (
                <Button variant="outline" className="gap-2 border-zinc-300" asChild>
                  <a href="/britrock" target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> View page
                  </a>
                </Button>
              )}
              {event && !creating && (
                <Button
                  variant="outline"
                  className="gap-2 border-zinc-300"
                  onClick={startNewEvent}
                >
                  <CalendarPlus className="h-4 w-4" /> New event
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className={fieldLabel}>
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="2026 Film Tour"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className={fieldLabel}>
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  className={selectClass}
                  value={form.status}
                  onChange={handleChange}
                >
                  {(Object.keys(STATUS_LABELS) as BritRockStatus[]).map(s => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className={fieldLabel}>
                Programme
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="The films being shown this year..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className={fieldLabel}>
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Divinity School, St John's College"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startsAt" className={fieldLabel}>
                  Date & Time
                </Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className={fieldLabel}>
                  Guest price (£)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className={fieldLabel}>
                  Guest tickets available
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="No limit"
                  value={form.capacity}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberMeetID" className={fieldLabel}>
                  Member signup meet
                </Label>
                <select
                  id="memberMeetID"
                  name="memberMeetID"
                  className={selectClass}
                  value={form.memberMeetID}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {/* Keep a saved meet selectable once it's no longer upcoming */}
                  {form.memberMeetID &&
                    !meets.some(m => m.id.toString() === form.memberMeetID) && (
                      <option value={form.memberMeetID}>
                        Meet #{form.memberMeetID}
                      </option>
                    )}
                  {meets.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundNote" className={fieldLabel}>
                Refund policy
              </Label>
              <Input
                id="refundNote"
                name="refundNote"
                placeholder="Refunds are not available after November 15th."
                value={form.refundNote}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-zinc-50 rounded border">
              <Checkbox
                id="showInSidebar"
                checked={form.showInSidebar}
                onCheckedChange={v =>
                  setForm(prev => ({ ...prev, showInSidebar: !!v }))
                }
              />
              <Label
                htmlFor="showInSidebar"
                className="text-[10px] uppercase font-bold cursor-pointer"
              >
                Show Brit Rock in the website sidebar (not while it's a draft)
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              {creating && event && (
                <Button type="button" variant="outline" onClick={cancelNewEvent}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="gap-2 bg-zinc-900"
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : creating ? 'Create event' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {event && !creating && (
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-black tracking-tight uppercase italic">
                  Guest Tickets
                </CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                  {tickets.length}
                  {event.capacity ? ` of ${event.capacity}` : ''} sold
                  {tickets.length > 0 &&
                    ` · ${formatPrice(tickets.length * event.price)} at the current price`}
                  . Members who signed up through the meet are listed on that
                  meet instead.
                </CardDescription>
              </div>
              <CSVLink
                data={csvData}
                filename={`britrock-${event.id}-tickets.csv`}
                className="no-underline"
              >
                <Button variant="outline" className="gap-2 border-zinc-300">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </CSVLink>
            </div>
          </CardHeader>

          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search by name, email or ticket ID..."
                className="pl-10 h-11 border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>

            <div className="rounded-md border border-zinc-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                      Ticket
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px] hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-zinc-700 uppercase tracking-wider text-[11px] hidden md:table-cell">
                      Bought
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map(t => (
                      <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                          #{t.ticket}
                        </td>
                        <td className="px-4 py-3 font-bold text-zinc-900">
                          {t.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 font-medium hidden md:table-cell">
                          {t.email}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500 hidden md:table-cell">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString('en-GB')
                            : ''}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-zinc-500 italic">
                        {searchStr
                          ? 'No tickets found matching your search.'
                          : 'No guest tickets sold yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BritRockManager;
