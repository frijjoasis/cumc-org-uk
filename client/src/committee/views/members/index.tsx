import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { 
  Search, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Users
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/models';

const Members = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/user/list')
      .then(res => {
        setMembers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredMembers = members.filter(u => {
    const searchStr = filter.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const displayName = u.displayName.toLowerCase();
    const college = (u.college || '').toLowerCase();
    
    // Check for explicit "paid" search or standard name/college match
    const matchesPaid = searchStr === 'paid' && u.member?.hasPaid;
    const matchesText = fullName.includes(searchStr) || 
                       displayName.includes(searchStr) || 
                       college.includes(searchStr);

    return matchesPaid || (searchStr !== 'paid' && matchesText);
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight uppercase italic">
                Member Directory
              </CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                Manage and view all registered users. Use the search to filter by name, college, or membership status.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name, college, or type 'paid'..."
              className="pl-10 h-11 border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {/* Members Table */}
          <div className="rounded-md border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px]">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px]">College</th>
                  <th className="px-4 py-3 text-center font-bold text-zinc-700 uppercase tracking-wider text-[11px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-zinc-500">Loading members...</td>
                  </tr>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-4 py-4">
                        <NavLink 
                          to={`/committee/members/${u.id}`}
                          className="flex items-center gap-2 font-bold text-zinc-900 hover:text-primary transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <UserIcon className="h-4 w-4" />
                          </div>
                          <span>{u.firstName ? `${u.firstName} ${u.lastName}` : u.displayName}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                      </td>
                      <td className="px-4 py-4 text-zinc-600 font-medium">
                        {u.college || <span className="text-zinc-300 italic">None</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          {u.member?.hasPaid ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1 rounded-full px-3">
                              <CheckCircle2 className="h-3 w-3" />
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-400 border-zinc-200 gap-1 rounded-full px-3">
                              <XCircle className="h-3 w-3" />
                              Unpaid
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-zinc-500 italic">
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-[11px] text-zinc-400 font-medium uppercase tracking-widest text-right">
            Total Members: {filteredMembers.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Members;