import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserCog, 
  Search, 
  TriangleAlert, 
  RefreshCcw,
  ExternalLink,
  Lock
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import MembershipChanger from '../../../components/MembershipChanger/MembershipChanger';
import { Member, User } from '@/types/models';
import { Label } from '@/components/ui/label';

interface WebmasterProps {
  user: User;
  member: Member;
}

const Webmaster = ({ user, member }: WebmasterProps) => {
  const [content, setContent] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<{ err: string | null; success: string | null }>({ err: null, success: null });
  const [isResetting, setIsResetting] = useState(false);

  const hasRootAccess = member?.committee === 'root';

  const refreshData = (error: string | null = null, success: string | null = null) => {
    axios.get('/api/user/list').then(res => {
      setContent(res.data);
      setStatus({ err: error, success: success });
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleResetMemberships = async () => {
    if (!window.confirm("CRITICAL ACTION: This will revoke membership from EVERYONE. Are you absolutely sure?")) return;
    
    setIsResetting(true);
    try {
      const res = await axios.get('/api/member/reset');
      if (res.data.err) setStatus({ err: res.data.err, success: null });
      else setStatus({ err: null, success: 'All memberships have been purged successfully.' });
      refreshData();
    } catch (err) {
      setStatus({ err: 'Failed to execute reset command.', success: null });
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = content.filter(u => {
    const searchStr = filter.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const displayName = (u.displayName || '').toLowerCase();
    
    if (searchStr === 'paid') return u.member?.hasPaid;
    return fullName.includes(searchStr) || displayName.includes(searchStr);
  });

  if (!hasRootAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md border-2">
          <Lock className="h-5 w-5" />
          <AlertTitle className="font-black uppercase italic tracking-tighter">Access Denied</AlertTitle>
          <AlertDescription className="font-medium">
            Your account does not have <code>root</code> level committee permissions. 
            This area is restricted to the Webmaster.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {status.err && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription className="font-bold">{status.err}</AlertDescription>
        </Alert>
      )}
      {status.success && (
        <Alert className="border-emerald-500 text-emerald-700 bg-emerald-50">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="font-bold uppercase tracking-tight italic">{status.success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Permission Overview */}
        <Card className="md:col-span-1 border-zinc-900 bg-zinc-900 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="p-2 bg-emerald-500 w-fit rounded-lg mb-2">
              <ShieldCheck className="h-5 w-5 text-zinc-900" />
            </div>
            <CardTitle className="text-xl font-black uppercase italic tracking-tight">Root Terminal</CardTitle>
            <CardDescription className="text-zinc-400 font-mono text-[10px] uppercase">
              Operator: {user?.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              You are authenticated with global write permissions. All actions performed here are logged and final.
            </p>
            <div className="pt-4 border-t border-zinc-800">
              <Label className="text-[10px] uppercase font-black text-rose-500 tracking-widest block mb-3">Emergency Functions</Label>
              <Button 
                variant="destructive" 
                className="w-full font-black uppercase italic tracking-widest text-[11px] h-12 gap-2"
                onClick={handleResetMemberships}
                disabled={isResetting}
              >
                <RefreshCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                Reset Membership DB
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Role Management */}
        <Card className="md:col-span-2 border-zinc-200 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <UserCog className="h-6 w-6" />
                  Privilege Manager
                </CardTitle>
                <CardDescription>Update global committee roles and payment overrides.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search name or type 'paid'..." 
                className="pl-10 h-11 border-zinc-200 focus:ring-zinc-900 transition-all"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-zinc-100 overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                    <th className="px-6 py-4 text-left">Identity</th>
                    <th className="px-6 py-4 text-center">System Role</th>
                    <th className="px-6 py-4 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <NavLink to={`/committee/members/${u.id}`} className="flex items-center gap-2 group">
                            <span className="font-bold text-zinc-900 group-hover:text-primary transition-colors">
                              {u.firstName ? `${u.firstName} ${u.lastName}` : u.displayName}
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                          </NavLink>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className={`font-mono text-[10px] ${u.member?.committee === 'root' ? 'border-rose-200 text-rose-600 bg-rose-50' : ''}`}>
                            {u.member?.committee || 'standard'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 flex justify-end">
                          <MembershipChanger 
                            callback={() => refreshData(null, 'Membership updated.')}
                            default={u.member && u.member.hasPaid}
                            id={u.id}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 italic">No matches found in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Webmaster;