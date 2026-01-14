import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { 
  User as UserIcon, 
  History, 
  MapPin, 
  Phone, 
  LifeBuoy, 
  Mail, 
  Calendar,
  AlertCircle,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { User, Meet } from '@/types/models';

interface MeetHistoryItem {
  meet: Meet;
  createdAt?: string;
}

const ViewMember = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<MeetHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [userRes, historyRes] = await Promise.all([
          axios.post('/api/user/member', { id }),
          axios.post('/api/meets/historyOther', { id })
        ]);

        if (userRes.data.err) setError(userRes.data.err);
        else setUser(userRes.data);
        
        setHistory(historyRes.data);
      } catch (err) {
        setError("Could not retrieve member profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-12 text-center animate-pulse font-black italic text-zinc-400 uppercase tracking-widest">Accessing Profile...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Bio Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <div className="h-24 bg-zinc-900 flex items-end justify-center pb-4">
              <div className="h-20 w-20 rounded-full bg-white border-4 border-zinc-900 flex items-center justify-center -mb-10 shadow-xl">
                <UserIcon className="h-10 w-10 text-zinc-400" />
              </div>
            </div>
            <CardContent className="pt-12 text-center space-y-4">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                  {user?.firstName} {user?.lastName}
                </h2>
                <Badge variant="outline" className="mt-1 font-mono uppercase text-[10px]">
                  {user?.college || 'No College'}
                </Badge>
              </div>

              <div className="flex justify-center py-2">
                {user?.member?.hasPaid ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-none px-4 py-1">Active Member</Badge>
                ) : (
                  <Badge variant="destructive" className="px-4 py-1 italic">Membership Lapsed</Badge>
                )}
              </div>

              <div className="text-left space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Mail className="h-4 w-4 text-zinc-400" /> {user?.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Phone className="h-4 w-4 text-zinc-400" /> {user?.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Calendar className="h-4 w-4 text-zinc-400" /> DOB: {user?.dob}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency & Medical (Safety Focus) */}
          <Card className="border-rose-100 bg-rose-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" /> Safety Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Emergency Contact</p>
                <p className="text-sm font-bold text-zinc-900">{user?.emergencyName || 'Missing'}</p>
                <p className="text-xs text-zinc-600">{user?.emergencyPhone}</p>
              </div>
              <div className="space-y-1 border-t border-rose-100 pt-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Medical Information</p>
                <p className="text-xs text-rose-800 font-medium leading-relaxed">
                  {user?.medicalInfo || "No medical info disclosed."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Address & Meet History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Physical Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 space-y-1">
              <p>{user?.address1}</p>
              {user?.address2 && <p>{user?.address2}</p>}
              <p className="font-bold text-zinc-900">{user?.postCode}, {user?.city}</p>
              <p className="uppercase tracking-widest text-[10px]">{user?.country}</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-zinc-500" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Meet History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow className="text-[10px] uppercase font-bold text-zinc-400">
                    <TableHead>Meet</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length > 0 ? (
                    history.map((s, i) => (
                      <TableRow key={i} className="hover:bg-zinc-50/50">
                        <TableCell className="font-bold text-zinc-900">{s.meet.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase">{s.meet.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">£{s.meet.price || 0}</TableCell>
                        <TableCell className="text-right text-zinc-500 text-xs">
                          {new Date(s.meet.startDate).toLocaleDateString('en-GB')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-zinc-400 italic">
                        No recorded meet attendance.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewMember;