import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Users,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MeetContent, Question, SignupData } from '@/types/meet';

const MeetView = () => {
  const { id } = useParams();
  const [data, setData] = useState<MeetContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/meets/signups/${id}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-12 text-center animate-pulse font-black italic text-zinc-400">
        Loading Signups...
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

  // Helper to find an answer for a specific question ID
  const getAnswer = (signup: SignupData, questionId: number) => {
    const answer = signup.answers?.find(a => a.id === questionId);
    return answer ? answer.value : '-';
  };

  return (
    <div className="space-y-6">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            {data.title}
          </h2>
          <p className="text-zinc-500 font-medium">
            Attendance & Logistics Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button className="gap-2 bg-primary">
            <Mail className="h-4 w-4" /> Email All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-xl text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Attendance
                  </p>
                  <h3 className="text-2xl font-black italic">
                    {signups.length}
                    <span className="text-zinc-300 text-lg">
                      {' '}
                      / {data.maxSignups ?? '∞'}
                    </span>
                  </h3>
                </div>
              </div>
              {data.maxSignups && (
                <Badge
                  className={`${signups.length >= data.maxSignups ? 'bg-rose-500' : 'bg-emerald-500'} text-white border-none`}
                >
                  {Math.round((signups.length / data.maxSignups) * 100)}%
                </Badge>
              )}
            </div>

            {/* Capacity Progress Bar */}
            {data.maxSignups && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      signups.length / data.maxSignups >= 1
                        ? 'bg-rose-500'
                        : signups.length / data.maxSignups > 0.8
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min((signups.length / data.maxSignups) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase text-right">
                  {data.maxSignups - signups.length <= 0
                    ? 'Waitlist Active'
                    : `${data.maxSignups - signups.length} spots remaining`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-zinc-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Total Signups
                </p>
                <h3 className="text-2xl font-black">{signups.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Add more cards for "Paid", "Drivers", etc. here */}
      </div>

      {/* Main Signups Table */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
          <CardTitle className="text-sm font-bold uppercase tracking-widest">
            Attendee List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/30">
                <tr className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                  <th className="px-6 py-4 text-left">Member</th>
                  <th className="px-6 py-4 text-left">Payment</th>
                  {/* Dynamically render columns for each custom question */}
                  {questions.map(q => (
                    <th key={q.id} className="px-6 py-4 text-left">
                      {q.title}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {signups.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">
                        {s.user?.firstName} {s.user?.lastName}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {s.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.captureID ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Captured
                        </Badge>
                      ) : s.authID ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 shadow-none gap-1"
                        >
                          <Clock className="h-3 w-3" /> Authorized
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-zinc-400">
                          No Payment
                        </Badge>
                      )}
                    </td>
                    {/* Render the answers to custom questions */}
                    {questions.map(q => (
                      <td
                        key={q.id}
                        className="px-6 py-4 text-zinc-600 font-medium"
                      >
                        {getAnswer(s, q.id)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right text-zinc-400 text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetView;
