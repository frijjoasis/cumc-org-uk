import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UserCard from '@/components/UserCard/UserCard';

// Assets
import img from '@/assets/img/committee-1.jpg';
import defaultProfile from '@/assets/img/committee/gear.jpg';
import defaultCover from '@/assets/img/committee/gearCover.jpg';

// Types
import { CommitteePersonData } from '@/types/committee';
import { Committee } from '@/types/models';

const CommitteeAbout = () => {
  const [currentCommittee, setCurrentCommittee] = useState<Committee[]>([]);
  const [pastCommittees, setPastCommittees] = useState({ head: [], body: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentRes, pastRes] = await Promise.all([
          axios.get('/api/committee/current'),
          axios.get('/api/committee/past'),
        ]);
        setCurrentCommittee(currentRes.data);
        setPastCommittees(pastRes.data);
      } catch (error) {
        console.error('Error fetching committee data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="animate-pulse font-bold text-zinc-500 text-lg uppercase tracking-widest">
          Loading Committee...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 px-2 md:px-0 max-w-7xl mx-auto">
      {/* Current Committee Section */}
      <section className="space-y-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">
            Current Committee
          </h2>
          <p className="text-zinc-600 font-medium">
            Meet the 2025/26 CUMC committee members.
          </p>
        </div>

        {currentCommittee.length === 0 ? (
          <Card className="p-12 text-center text-zinc-400 italic">
            No current committee found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentCommittee.map((member, index) => {
              const memberData: CommitteePersonData = {
                role: member.role,
                name: member.person_name,
                social:
                  member.person_email ||
                  `${member.role.toLowerCase().replace(/\s+/g, '-')}@cumc.org.uk`,
                profile: defaultProfile,
                cover: defaultCover,
              };
              return <UserCard key={index} person={memberData} />;
            })}
          </div>
        )}
      </section>

      {/* Past Committees Section */}
      <Card className="shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white pb-4 border-b">
          <CardTitle className="text-2xl font-black uppercase tracking-tight">
            Past Committees
          </CardTitle>
          <p className="text-zinc-500 text-sm font-medium">
            The history of CUMC leadership.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table: Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  {pastCommittees.head.map((prop, key) => (
                    <TableHead
                      key={key}
                      className="font-bold text-zinc-900 uppercase text-[10px] tracking-widest py-4"
                    >
                      {prop}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastCommittees.body.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-zinc-50/50">
                    {row.map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className="text-[11px] font-medium text-zinc-700 py-3 whitespace-nowrap"
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile "Cards" View: Hidden on desktop */}
          <div className="md:hidden divide-y divide-zinc-100">
            {pastCommittees.body.map((row, rowIndex) => (
              <div key={rowIndex} className="p-4 bg-white space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded">
                    {row[0]} {/* Year */}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[13px]">
                  {pastCommittees.head.slice(1).map((title, titleIndex) => (
                    <div key={titleIndex} className="flex gap-2">
                      <span className="font-bold text-zinc-900 w-24 shrink-0 uppercase text-[10px] self-center">
                        {title}:
                      </span>
                      <span className="text-zinc-600">
                        {row[titleIndex + 1] || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Photo */}
      <Card className="overflow-hidden border-none shadow-xl">
        <img src={img} className="w-full object-cover" alt="Committee Group" />
        <CardFooter className=" text-center justify-center italic text-sm">
          The current committee members, at the 2024 Annual General Meeting
        </CardFooter>
      </Card>
    </div>
  );
};

export default CommitteeAbout;
