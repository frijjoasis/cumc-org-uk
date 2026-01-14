import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { Calendar, Clock, MapPin, Tag, ArrowRight, Lock } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types/models';

const UpcomingMeets = ({ user }: { user: User }) => {
  const [meets, setMeets] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/meets/upcoming').then(res => setMeets(res.data));
  }, []);

  const sortedMeets = [...meets]
    .filter(m => !m.hidden)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-8">
      {!user && (
        <Alert className="bg-zinc-900 border-none text-white shadow-xl">
          <Lock className="h-4 w-4 text-primary" />
          <AlertDescription className="font-bold uppercase tracking-tight text-xs italic">
            Authentication Required:{' '}
            <NavLink
              to="/login"
              className="underline decoration-primary underline-offset-4"
            >
              Sign in
            </NavLink>{' '}
            to register for upcoming trips.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">
          Upcoming Trips
        </h1>
        <p className="text-zinc-500 font-medium">
          Join us on the rock. Secure your spot below.
        </p>
      </div>

      <div className="grid gap-6">
        {sortedMeets.length > 0 ? (
          sortedMeets.map(meet => (
            <Card
              key={meet.id}
              className="group border-zinc-200 hover:border-zinc-900 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-2xl"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-zinc-50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Date
                    </span>
                    <div className="text-2xl font-black uppercase italic text-zinc-900 leading-none">
                      {new Date(meet.startDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="text-zinc-500 font-bold text-xs uppercase italic">
                      {new Date(meet.startDate).getFullYear()}
                    </div>
                  </div>
                </div>

                <CardHeader className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      variant="outline"
                      className="rounded-none border-zinc-200 uppercase text-[9px] tracking-widest font-black"
                    >
                      {meet.type}
                    </Badge>
                    {meet.disabled ? (
                      <Badge className="bg-zinc-200 text-zinc-500 hover:bg-zinc-200 uppercase text-[9px] font-black">
                        Full / Closed
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 uppercase text-[9px] font-black animate-pulse">
                        Open
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl font-black uppercase italic tracking-tight group-hover:text-primary transition-colors">
                    {meet.title}
                  </CardTitle>
                  <p className="text-zinc-500 font-medium leading-relaxed line-clamp-2">
                    {meet.subtitle}
                  </p>
                </CardHeader>

                <div className="p-8 flex items-center">
                  <Button
                    asChild
                    className="w-full md:w-auto bg-zinc-900 text-white font-black uppercase italic tracking-widest gap-2"
                  >
                    <NavLink to={`/meets/upcoming/view/${meet.id}`}>
                      Details <ArrowRight className="h-4 w-4" />
                    </NavLink>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
            <Calendar className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <h3 className="font-black uppercase italic text-zinc-400 tracking-tighter">
              No current sessions running
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingMeets;
