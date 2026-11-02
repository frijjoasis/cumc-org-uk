import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Ticket,
  RotateCcw,
  TriangleAlert,
  CheckCircle2,
  User as UserIcon,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface WaiverUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  email: string;
  college: string | null;
  member: { hasPaid: boolean };
}

const nameOf = (u: WaiverUser) =>
  u.firstName ? `${u.firstName} ${u.lastName}` : u.displayName;

const Waivers = () => {
  const [users, setUsers] = useState<WaiverUser[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    err: string | null;
    success: string | null;
  }>({ err: null, success: null });

  const refresh = () =>
    axios
      .get('/api/member/waivers')
      .then(res => setUsers(res.data))
      .catch(() =>
        setStatus({ err: 'Could not load meet waivers.', success: null })
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const handleReset = async (u: WaiverUser) => {
    if (!window.confirm(`Give ${nameOf(u)} their meet waiver back?`)) return;

    setResetting(u.id);
    try {
      const res = await axios.post('/api/member/waivers/reset', { id: u.id });
      if (res.data.err) {
        setStatus({ err: res.data.err, success: null });
      } else {
        setStatus({
          err: null,
          success: `${nameOf(u)} can now attend one meet without membership.`,
        });
        setUsers(prev => prev.filter(x => x.id !== u.id));
      }
    } catch (err: any) {
      setStatus({
        err: err.response?.data?.err || 'Failed to reset meet waiver.',
        success: null,
      });
    } finally {
      setResetting(null);
    }
  };

  // Paid members never need a waiver, so they only appear when searched for
  const searchStr = filter.trim().toLowerCase();
  const filtered = users.filter(u => {
    if (!searchStr) return !u.member.hasPaid;
    return (
      nameOf(u).toLowerCase().includes(searchStr) ||
      u.displayName.toLowerCase().includes(searchStr) ||
      u.email.toLowerCase().includes(searchStr)
    );
  });
  const usedCount = users.filter(u => !u.member.hasPaid).length;

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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight uppercase italic">
                Meet Waivers
              </CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                Non-members who have used their one free meet without
                membership. Resetting a waiver lets them sign up to one more
                meet before they need to join. Searching also shows paid
                members, who don't need a waiver.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name or email..."
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
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px] hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-zinc-500">
                      Loading waivers...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-4">
                        <NavLink
                          to={`/committee/members/${u.id}`}
                          className="flex items-center gap-2 font-bold text-zinc-900 hover:text-primary transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-500">
                            <UserIcon className="h-4 w-4" />
                          </div>
                          <span>{nameOf(u)}</span>
                        </NavLink>
                      </td>
                      <td className="px-4 py-4 text-zinc-600 font-medium hidden md:table-cell">
                        {u.email}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {u.member.hasPaid ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1 rounded-full px-3">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid member
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={resetting === u.id}
                            onClick={() => handleReset(u)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            {resetting === u.id ? 'Resetting...' : 'Reset'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-zinc-500 italic">
                      {searchStr
                        ? 'No users found matching your search.'
                        : 'No used meet waivers.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[11px] text-zinc-400 font-medium uppercase tracking-widest text-right">
            Used Waivers: {usedCount}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Waivers;
