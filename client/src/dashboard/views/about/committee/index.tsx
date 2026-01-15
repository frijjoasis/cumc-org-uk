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

import img from '@/assets/img/committee-1.jpg';
import defaultProfile from '@/assets/img/committee/gear.jpg';
import defaultCover from '@/assets/img/committee/gearCover.jpg';

import { CommitteePersonData } from '@/types/committee';
import { PublicCommitteeModel } from '@/types/models';

interface PastCommitteeData {
  [year: string]: {
    person_name: string;
    role: string;
  }[];
}

const CommitteeAbout = () => {
  const [currentCommittee, setCurrentCommittee] = useState<
    PublicCommitteeModel[]
  >([]);
  const [pastCommittees, setPastCommittees] = useState<PastCommitteeData>({});
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

  const [uploading, setUploading] = useState<number | null>(null);

  const handlePhotoUpload = async (memberId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('memberId', memberId.toString());

    setUploading(memberId);
    try {
      await axios.post('/api/committee/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh the committee data to show the new image
      const currentRes = await axios.get('/api/committee/current');
      setCurrentCommittee(currentRes.data);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image.');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="animate-pulse font-bold text-zinc-500 text-lg uppercase tracking-widest">
          Loading Committee...
        </p>
      </div>
    );
  }

  const years = Object.keys(pastCommittees).sort((a, b) => b.localeCompare(a));

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCommittee.map(member => {
              const profileUrl = member.profile_hash
                ? `/img/committee/${member.year}/${member.profile_hash}.jpg`
                : defaultProfile;

              const coverUrl = member.cover_hash
                ? `/img/committee/${member.year}/${member.cover_hash}.jpg?v=${Date.now()}`
                : defaultCover;

              const memberData: CommitteePersonData = {
                role: member.role,
                name: member.person_name,
                social: member.email_alias,
                profile: profileUrl,
                cover: coverUrl,
              };

              return <UserCard key={member.person_name} person={memberData} />;
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead className="font-bold text-zinc-900 uppercase text-[10px] tracking-widest py-4 w-32 pl-6">
                    Year
                  </TableHead>
                  <TableHead className="font-bold text-zinc-900 uppercase text-[10px] tracking-widest py-4">
                    Committee Members
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map(year => (
                  <TableRow
                    key={year}
                    className="hover:bg-zinc-50/50 align-top"
                  >
                    <TableCell className="text-xs font-black text-primary py-4 pl-6">
                      {year}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                        {pastCommittees[year].map((member, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col border-l-2 border-zinc-100 pl-3"
                          >
                            <span className="text-[10px] uppercase font-bold text-zinc-400 leading-tight">
                              {member.role}
                            </span>
                            <span className="text-sm font-medium text-zinc-800">
                              {member.person_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
