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
  Car,
} from 'lucide-react';
import { CSVLink } from 'react-csv';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { MeetContent, SignupData } from '@/types/meet';

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

    try {
      const payload = signup ? { id, authID: signup.authID } : { id };
      const response = await axios.post(`/api/paypal/${url}`, payload);

      if (!signup && response.data.success) {
        const { captured, voided, failed, skipped, errors } = response.data;
        let msg = `Operation complete:\n`;
        if (captured) msg += `✓ Captured: ${captured}\n`;
        if (voided) msg += `✓ Voided: ${voided}\n`;
        if (failed) msg += `✗ Failed: ${failed}\n`;
        if (skipped) msg += `- Skipped: ${skipped}\n`;
        if (errors && errors.length > 0) {
          msg += `\nErrors:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) msg += `\n... and ${errors.length - 5} more`;
        }
        alert(msg);
      }

      fetchData(); // Refresh the table
    } catch (err) {
      console.error('Payment action error:', err);
      alert('Payment action failed. Check console for details.');
    }
  };

  const deleteSignup = async (signupId: number) => {
    if (!window.confirm('Delete this signup? This cannot be undone.')) return;
    try {
      await axios.post(`/api/meets/deleteSignup`, { id: signupId });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getCSVData = () => {
    if (!data || !data.signups) return [];

    const headers = ['Name', 'Email', 'Signed Up', 'Status', 'AuthID'];
    const questionTitles = (data.questions || []).map(q => q.title);

    const rows = data.signups.map(s => {
      const getPaymentStatus = () => {
        if (s.captureID === 'Void' || s.captureID === 'Void Failed')
          return s.captureID;
        if (s.captureID === 'Capture Failed') return 'Capture Failed';
        if (s.captureID === 'Not Paying') return 'Free Entry';
        if (s.captureID) return 'Captured';
        if (s.authID) return 'Authorized';
        return 'Unpaid';
      };

      const basicInfo = [
        `${s.user?.firstName} ${s.user?.lastName}`,
        s.user?.email,
        new Date(s.createdAt).toISOString(),
        getPaymentStatus(),
        s.authID || '-',
      ];

      const answers = (data.questions || []).map(q => {
        const ans = s.answers?.find(
          (a: { id: any; questionID: any }) =>
            a.id === q.id || a.questionID === q.id
        );
        if (!ans) return '-';
        if (ans.value === true || ans.value === 'true') return 'Yes';
        if (ans.value === false || ans.value === 'false') return 'No';
        return ans.value;
      });

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
                      {s.captureID === 'Void' ||
                      s.captureID === 'Void Failed' ? (
                        <Badge className="bg-zinc-500 text-white border-none">
                          {s.captureID}
                        </Badge>
                      ) : s.captureID === 'Capture Failed' ? (
                        <Badge className="bg-rose-500 text-white border-none">
                          Capture Failed
                        </Badge>
                      ) : s.captureID === 'Not Paying' ? (
                        <Badge className="bg-blue-500 text-white border-none">
                          Free Entry
                        </Badge>
                      ) : s.captureID ? (
                        <Badge className="bg-emerald-500 text-white border-none">
                          Captured
                        </Badge>
                      ) : s.authID ? (
                        <Badge className="bg-amber-500 text-white border-none">
                          Authorized
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Unpaid</Badge>
                      )}
                    </td>
                    {questions.map(q => {
                      const ans = s.answers?.find(
                        (a: { id: any; questionID: any }) =>
                          a.id === q.id || a.questionID === q.id
                      );
                      const displayValue =
                        ans?.value === true || ans?.value === 'true'
                          ? 'Yes'
                          : ans?.value === false || ans?.value === 'false'
                            ? 'No'
                            : ans?.value || '-';
                      return (
                        <td key={q.id} className="px-6 py-4 text-zinc-600">
                          {displayValue}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        {s.authID &&
                          (!s.captureID ||
                            s.captureID === 'Capture Failed') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600"
                              onClick={() => handlePaypalAction('capture', s)}
                              title={
                                s.captureID === 'Capture Failed'
                                  ? 'Retry capture'
                                  : 'Capture payment'
                              }
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        {s.authID &&
                          (!s.captureID ||
                            s.captureID === 'Void Failed' ||
                            s.captureID === 'Capture Failed') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-600"
                              onClick={() => handlePaypalAction('void', s)}
                              title={
                                s.captureID === 'Void Failed'
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
                          onClick={() => deleteSignup(s.id)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="gap-2 py-6 border-zinc-200"
          asChild
        >
          <Link to={`/committee/meets/reimburse/${id}`}>
            <Car className="h-4 w-4" /> Reimburse Drivers
          </Link>
        </Button>
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
