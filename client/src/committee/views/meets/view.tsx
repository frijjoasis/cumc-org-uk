import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Download,
  CheckCircle2,
  Clock,
  Mail,
  Trash2,
  CreditCard,
  XCircle,
  Edit3,
} from 'lucide-react';
import { CSVLink } from 'react-csv';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { MeetContent, SignupData } from '@/types/meet';
import {
  canCapture,
  canVoid,
  describeIssue,
  describeState,
  getPaymentState,
  type PaymentState,
} from './paymentStatus';
import { findAnswer, formatAnswer } from '@/lib/meetAnswers';

interface BatchFailure {
  signupID: number;
  name: string;
  issue: string;
}

function summarise(
  action: 'capture' | 'void',
  totals: { done: number; recovered: number; failed: number; skipped: number },
  failures: BatchFailure[],
  notes: string[],
  isBulk: boolean
): string | null {
  const lines: string[] = [];
  if (isBulk) {
    if (totals.done)
      lines.push(`✓ ${action === 'capture' ? 'Captured' : 'Voided'}: ${totals.done}`);
    if (totals.recovered)
      lines.push(`✓ Already captured on PayPal (record fixed): ${totals.recovered}`);
    if (totals.failed) lines.push(`✗ Failed: ${totals.failed}`);
    if (totals.skipped) lines.push(`- Skipped: ${totals.skipped}`);
  } else if (totals.recovered) {
    lines.push(
      'This payment had already been captured on PayPal. The record has been updated.'
    );
  }
  if (failures.length > 0) {
    lines.push('');
    for (const f of failures.slice(0, 10)) {
      const d = describeIssue(f.issue);
      lines.push(`✗ ${f.name}: ${d.label}. ${d.action}`);
    }
    if (failures.length > 10)
      lines.push(`... and ${failures.length - 10} more (see the Payment column)`);
  }
  if (notes.length > 0) lines.push('', 'Notes:', ...notes);

  if (!isBulk) return lines.length > 0 ? lines.join('\n') : null;
  return `Operation complete:\n${lines.length > 0 ? lines.join('\n') : 'Nothing to do.'}`;
}

const PaymentBadge = ({ state }: { state: PaymentState }) => {
  switch (state.kind) {
    case 'void':
    case 'expired':
      return (
        <Badge className="bg-zinc-500 text-white border-none">
          {describeState(state)}
        </Badge>
      );
    case 'captureFailed':
    case 'voidFailed': {
      const issue = describeIssue(state.issue);
      return (
        <div className="space-y-1 max-w-56" title={issue.action}>
          <Badge
            className={`${state.kind === 'captureFailed' ? 'bg-rose-500' : 'bg-zinc-500'} text-white border-none`}
          >
            {state.kind === 'captureFailed' ? 'Capture Failed' : 'Void Failed'}
          </Badge>
          <div className="text-[11px] font-bold text-rose-700">{issue.label}</div>
          <div className="text-[10px] leading-snug text-zinc-500">
            {issue.action}
          </div>
        </div>
      );
    }
    case 'free':
      return (
        <Badge className="bg-blue-500 text-white border-none">Free Entry</Badge>
      );
    case 'captured':
      return (
        <Badge className="bg-emerald-500 text-white border-none">Captured</Badge>
      );
    case 'authorized':
      return (
        <Badge className="bg-amber-500 text-white border-none">Authorized</Badge>
      );
    case 'unpaid':
      return <Badge variant="secondary">Unpaid</Badge>;
  }
};

const MeetView = () => {
  const { id } = useParams();
  const [data, setData] = useState<MeetContent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/meets/signups/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch signups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePaypalAction = async (url: string, signup?: SignupData) => {
    const action = url === 'capture' ? 'capture' : 'void';
    const confirmMsg = signup
      ? `Are you sure you want to ${action} payment for ${signup.user?.firstName}?`
      : `Are you sure you want to ${action} ALL payments for this meet?`;

    if (!window.confirm(confirmMsg)) return;

    // Server processes a bounded batch per call (BATCH_SIZE on the server).
    // We loop until done:true, sending back the rows already attempted so a
    // row that fails isn't retried by every batch. attemptID identifies this
    // click to PayPal, so a new click is a genuinely new capture attempt.
    const totals = { done: 0, recovered: 0, failed: 0, skipped: 0 };
    const failures: BatchFailure[] = [];
    const notes: string[] = [];
    const excludeIDs: number[] = [];
    const attemptID = crypto.randomUUID();
    const MAX_BATCHES = 50;

    try {
      for (let i = 0; i < MAX_BATCHES; i++) {
        const response = await axios.post(`/api/paypal/${url}`, {
          id,
          authID: signup?.authID,
          attemptID,
          excludeIDs,
        });
        const data = response.data;
        if (data.err) {
          alert(`Error: ${data.err}`);
          break;
        }
        totals.done += (url === 'capture' ? data.captured : data.voided) || 0;
        totals.recovered += data.recovered || 0;
        totals.failed += data.failed || 0;
        totals.skipped = data.skipped || 0;
        failures.push(...(data.failures || []));
        notes.push(...(data.notes || []));
        excludeIDs.push(...(data.processedIDs || []));
        if (data.done || signup) break;
      }

      const msg = summarise(action, totals, failures, notes, !signup);
      if (msg) alert(msg);
      fetchData();
    } catch (err) {
      console.error('Payment action error:', err);
      alert(
        'Payment action failed before the server replied. Some payments may ' +
          'have gone through: refresh to see the latest status before retrying.'
      );
      fetchData();
    }
  };

  const deleteSignup = async (signup: SignupData) => {
    const releasesHold = canVoid(getPaymentState(signup));
    const confirmMsg = releasesHold
      ? `Delete this signup? Their payment hold will be released first. This cannot be undone.`
      : 'Delete this signup? This cannot be undone.';
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await axios.post(`/api/meets/deleteSignup`, {
        id: signup.id,
      });
      if (res.data?.err) alert(`Error: ${res.data.err}`);
    } catch (err) {
      console.error(err);
      alert('Delete failed. Refresh to see the latest status.');
    }
    fetchData();
  };

  const getCSVData = () => {
    if (!data || !data.signups) return [];

    const headers = ['Name', 'Email', 'Signed Up', 'Status', 'AuthID'];
    const questionTitles = (data.questions || []).map(q => q.title);

    const rows = data.signups.map(s => {

      const basicInfo = [
        `${s.user?.firstName} ${s.user?.lastName}`,
        s.user?.email,
        new Date(s.createdAt).toISOString(),
        describeState(getPaymentState(s)),
        s.authID || '-',
      ];

      const answers = (data.questions || []).map(q =>
        formatAnswer(q, findAnswer(s.answers, q)?.value)
      );

      return [...basicInfo, ...answers];
    });

    return [[...headers, ...questionTitles], ...rows];
  };

  if (loading)
    return (
      <div className="p-12 text-center font-black italic text-zinc-400">
        Loading...
      </div>
    );
  if (!data)
    return (
      <Alert variant="destructive">
        <AlertTitle>Not Found</AlertTitle>
      </Alert>
    );

  const signups = data.signups || [];
  const questions = data.questions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            {data.title}
          </h2>
          <p className="text-zinc-500 font-medium italic">
            Meet Administration Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <CSVLink
            data={getCSVData()}
            filename={`meet-${id}-export.csv`}
            className="no-underline"
          >
            <Button variant="outline" className="gap-2 border-zinc-300">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </CSVLink>

          <Button className="gap-2 bg-zinc-900" asChild>
            <a href={`mailto:${signups.map(s => s.user?.email).join(';')}`}>
              <Mail className="h-4 w-4" /> Email All
            </a>
          </Button>
        </div>
      </div>

      {/* Stats row omitted for brevity, same as yours */}

      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/50 border-b border-zinc-100">
                <tr className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                  <th className="px-6 py-4 text-left">Member</th>
                  <th className="px-6 py-4 text-left">Payment</th>
                  {questions.map(q => (
                    <th key={q.id} className="px-6 py-4 text-left">
                      {q.title}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {signups.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-zinc-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">
                        {s.user?.firstName} {s.user?.lastName}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {s.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentBadge state={getPaymentState(s)} />
                    </td>
                    {questions.map(q => (
                      <td key={q.id} className="px-6 py-4 text-zinc-600">
                        {formatAnswer(q, findAnswer(s.answers, q)?.value)}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        {canCapture(getPaymentState(s)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600"
                            onClick={() => handlePaypalAction('capture', s)}
                            title={
                              getPaymentState(s).kind === 'captureFailed'
                                ? 'Retry capture'
                                : 'Capture payment'
                            }
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        {canVoid(getPaymentState(s)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600"
                            onClick={() => handlePaypalAction('void', s)}
                            title={
                              getPaymentState(s).kind === 'voidFailed'
                                ? 'Retry void'
                                : 'Void payment'
                            }
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600"
                          onClick={() => deleteSignup(s)}
                          title="Delete signup"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="gap-2 py-6 border-zinc-200 text-rose-600 hover:bg-rose-50"
          onClick={() => handlePaypalAction('void')}
        >
          <XCircle className="h-4 w-4" /> Void All
        </Button>
        <Button
          variant="outline"
          className="gap-2 py-6 border-zinc-200 text-emerald-600 hover:bg-emerald-50"
          onClick={() => handlePaypalAction('capture')}
        >
          <CheckCircle2 className="h-4 w-4" /> Capture All
        </Button>
        <Button className="gap-2 py-6 bg-zinc-900" asChild>
          <Link to={`/committee/meets/edit/${id}`}>
            <Edit3 className="h-4 w-4" /> Edit Meet
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MeetView;
