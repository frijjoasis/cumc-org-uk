import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  Info, 
  Github, 
  History, 
  User as UserIcon,
  AlertTriangle,
  Terminal
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Member } from '@/types/models';

interface CommitteeHomeProps {
  user: User;
  member: Member;
  isDev?: boolean;
}

const CommitteeHome = ({ user, member, isDev }: CommitteeHomeProps) => {
  const [committeeList, setCommitteeList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/committee/current')
      .then(res => {
        if (res.data.err) setError(res.data.err);
        else setCommitteeList(res.data);
      })
      .catch(() => setError("Failed to fetch committee data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Dev Mode Notification */}
      {isDev && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
          <Terminal className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Developer Session</AlertTitle>
          <AlertDescription className="text-sm">
            You are logged in via <strong>ID: 999999999</strong>. Database-linked committee roles may not appear.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Welcome & Committee List */}
        <Card className="lg:col-span-2 border-zinc-200 shadow-sm">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black uppercase italic tracking-tight">Committee Area</CardTitle>
                <CardDescription>
                  Welcome back, <span className="text-zinc-900 font-bold">{user?.displayName || 'Admin'}</span>. 
                  Role: <Badge variant="outline" className="ml-1 uppercase text-[10px]">{member?.committee || 'Dev-Admin'}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border border-zinc-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50/50">
                  <tr className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                    <th className="px-4 py-3 text-left">Member</th>
                    <th className="px-4 py-3 text-left">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {committeeList.length > 0 ? (
                    committeeList.map((c, i) => (
                      <tr key={i} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-900 flex items-center gap-2">
                          <UserIcon className="h-3 w-3 text-zinc-400" />
                          {c.person_name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="font-medium bg-zinc-100 text-zinc-700">
                            {c.role}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-zinc-400 italic">
                        {loading ? 'Syncing committee data...' : 'No current committee records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-zinc-200 shadow-sm bg-blue-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="h-4 w-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-wide">Webmaster Briefing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-3 text-zinc-600 font-medium">
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Meet signups create a **payment promise** valid for 30 days.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Void promises before cancelling meets to prevent accidental charges.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Promises only cover up to **115%** of original price. Re-sign if price hikes.</span>
                </li>
                <li className="flex gap-2 text-emerald-700 font-bold">
                  <span className="text-emerald-500">•</span>
                  <span>Remember to fill out the reimbursement form after capture!</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="w-full justify-start gap-2 border-zinc-200" asChild>
              <a href="https://github.com/frijjoasis/cumc-org-uk/commits/master" target="_blank" rel="noreferrer">
                <History className="h-4 w-4" />
                Recent Changes
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 border-zinc-200" asChild>
              <a href="https://github.com/frijjoasis/cumc-org-uk" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" />
                Source Code
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeHome;