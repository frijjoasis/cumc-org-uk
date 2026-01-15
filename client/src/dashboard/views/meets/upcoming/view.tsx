import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink, useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Phone,
  PoundSterling,
  User,
  Users,
  ChevronLeft,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User as UserModel } from '@/types/models';

interface ViewMeetProps {
  user: UserModel;
}

const ViewMeet = ({ user }: ViewMeetProps) => {
  const { id } = useParams();
  const [content, setContent] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .post('/api/meets/view', { id })
      .then(res => {
        if (res.data.err) setErr(res.data.err);
        else setContent(res.data);
      })
      .catch(() => setErr('Failed to fetch meet details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-20 text-center font-black animate-pulse">
        LOADING TRIP DATA...
      </div>
    );
  if (err)
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{err}</AlertDescription>
      </Alert>
    );

  const signupCount = content.signups?.length || 0;
  const isFull =
    content.maxSignups !== null && signupCount >= content.maxSignups;

  const startDate = new Date(content.startDate);
  const endDate = new Date(content.endDate);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-4">
          <Button
            variant="ghost"
            asChild
            className="-ml-4 text-zinc-500 hover:text-zinc-900"
          >
            <NavLink to="/meets/upcoming">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Meets
            </NavLink>
          </Button>
          <div className="space-y-1">
            <Badge className="bg-primary text-zinc-900 uppercase font-black italic text-[10px] tracking-widest rounded-none mb-2">
              {content.type}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              {content.title}
            </h1>
            <p className="text-xl text-zinc-500 font-bold uppercase italic tracking-tight">
              {content.subtitle}
            </p>
            {content.maxSignups && (
              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase text-zinc-400">
                    Capacity
                  </p>
                  <p className="text-xs font-bold">
                    {signupCount} / {content.maxSignups}
                  </p>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                  <div
                    className={`h-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{
                      width: `${Math.min((signupCount / content.maxSignups) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {content.disabled ? (
            <Button
              disabled
              variant="outline"
              className="h-14 px-8 uppercase font-black italic border-zinc-200"
            >
              Coming Soon
            </Button>
          ) : (
            <Button
              asChild={!isFull}
              disabled={isFull || content.disabled}
              size="lg"
              className="h-14 px-8 bg-zinc-900 font-black uppercase italic tracking-widest shadow-xl hover:shadow-primary/20"
            >
              {isFull ? (
                <span>Trip Full</span>
              ) : (
                <NavLink
                  to={
                    user ? `/meets/upcoming/register/${content.id}` : '/login'
                  }
                >
                  {user ? 'Sign Up for This Trip' : 'Sign In to Register'}
                </NavLink>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Description & Signups */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-6">
              <div className="prose prose-zinc max-w-none">
                <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> The Plan
                </h3>
                <div className="text-zinc-600 font-medium leading-relaxed whitespace-pre-line text-lg pt-2 border-t border-zinc-100">
                  {content.desc}
                </div>
              </div>
            </CardContent>
          </Card>

          {user && (
            <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Trip Manifest
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase">
                  Members currently confirmed for this departure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {content.signups?.length > 0 ? (
                      content.signups.map((mem: any, i: number) => (
                        <TableRow key={i} className="group">
                          <TableCell className="py-4 px-6 font-bold text-zinc-700 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            {mem.displayName}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="py-10 text-center text-zinc-400 italic font-medium">
                          No signups yet. Be the first!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Logistics Card */}
        <div className="space-y-6">
          <Card className="border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <CardHeader className="bg-zinc-900 text-white p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic">
                Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-zinc-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                      Schedule
                    </p>
                    <p className="text-sm font-bold leading-tight">
                      {startDate.toLocaleDateString('en-GB')} —{' '}
                      {endDate.toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {startDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      Departure
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <PoundSterling className="h-5 w-5 text-zinc-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                      Trip Cost
                    </p>
                    <p className="text-2xl font-black italic">
                      £{Number(content.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 mt-1" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                        Emergency Lead
                      </p>
                      {user ? (
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase italic">
                            {content.user?.firstName} {content.user?.lastName}
                          </p>
                          <p className="text-sm font-mono flex items-center gap-2">
                            <Phone className="h-3 w-3" />{' '}
                            {content.user?.phone || 'No phone listed'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">
                          Sign in to view contact details
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase text-amber-800 tracking-widest italic">
                  Safety Requirement
                </h4>
                <p className="text-[11px] text-amber-700 leading-tight font-medium">
                  Participation requires a valid club membership and agreement
                  to the BMC participation statement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMeet;
