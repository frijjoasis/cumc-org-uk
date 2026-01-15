import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  Archive,
  Plus,
  ExternalLink,
  Edit3,
  Copy,
  Clock,
  ChevronRight,
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
import { MeetContent } from '@/types/meet';

const MeetManager = () => {
  const [content, setContent] = useState<MeetContent[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const isArchive = location.pathname === '/committee/meets/archive';

  useEffect(() => {
    setLoading(true);
    const endpoint = isArchive ? '/api/meets/all' : '/api/meets/upcoming';

    axios
      .get(endpoint)
      .then(res => {
        setContent(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isArchive]);

  // Sort logic: Upcoming (Ascending), Archive (Descending)
  const sortedMeets = [...content].sort((a, b) => {
    const aDate = new Date(a.startDate).getTime();
    const bDate = new Date(b.startDate).getTime();
    return isArchive ? bDate - aDate : aDate - bDate;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            {isArchive ? 'Meets Archive' : 'Active Meets'}
          </h2>
          <p className="text-zinc-500 font-medium">
            {isArchive
              ? 'Historical record of all club trips.'
              : 'Manage upcoming meets and signups.'}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none gap-2"
          >
            <NavLink
              to={isArchive ? '/committee/meets' : '/committee/meets/archive'}
            >
              {isArchive ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {isArchive ? 'Upcoming' : 'View Archive'}
            </NavLink>
          </Button>
          <Button
            asChild
            className="flex-1 sm:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <NavLink to="/committee/meets/new">
              <Plus className="h-4 w-4" />
              New Meet
            </NavLink>
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4 text-left">Meet Details</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Capacity</th>
                  <th className="px-6 py-4 text-left">Dates</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-400"
                    >
                      Loading meets...
                    </td>
                  </tr>
                ) : sortedMeets.length > 0 ? (
                  sortedMeets.map(meet => (
                    <tr
                      key={meet.id}
                      className="hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">
                          {meet.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono uppercase">
                          ID: {meet.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="bg-zinc-100 text-zinc-600 border-none capitalize"
                        >
                          {meet.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {meet.disabled ? (
                          <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 shadow-none">
                            Disabled
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 shadow-none">
                            Open
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-black italic text-zinc-900">
                            {meet.signupCount || 0} / {meet.maxSignups ?? '∞'}
                          </div>
                          {meet.maxSignups && (
                            <div className="w-12 h-1 bg-zinc-100 rounded-full mt-1 overflow-hidden border border-zinc-200">
                              <div
                                className={`h-full ${(meet.signupCount || 0) >= meet.maxSignups ? 'bg-rose-500' : 'bg-zinc-400'}`}
                                style={{
                                  width: `${Math.min(((meet.signupCount || 0) / meet.maxSignups) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-zinc-600 font-medium">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          {formatDate(meet.startDate)}
                        </div>
                        <div className="text-[11px] text-zinc-400 pl-5">
                          to {formatDate(meet.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                            title="View Details"
                          >
                            <NavLink to={`/committee/meets/view/${meet.id}`}>
                              <ExternalLink className="h-4 w-4 text-zinc-500" />
                            </NavLink>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                            title="Edit Meet"
                          >
                            <NavLink to={`/committee/meets/edit/${meet.id}`}>
                              <Edit3 className="h-4 w-4 text-zinc-500" />
                            </NavLink>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                            title="Clone Meet"
                          >
                            <NavLink to={`/committee/meets/clone/${meet.id}`}>
                              <Copy className="h-4 w-4 text-zinc-500" />
                            </NavLink>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-400 italic"
                    >
                      No meets found in this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center py-4">
        <div className="h-1 w-12 bg-zinc-200 rounded-full" />
      </div>
    </div>
  );
};

export default MeetManager;
