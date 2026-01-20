import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import Carousel from '@/components/Carousel/Carousel';
import AboutCard from '@/components/AboutCard/AboutCard';

import {
  aboutText,
  slides,
  membershipText,
  homeImagesOne,
  homeImagesTwo,
  homeImagesThree,
} from './text';

import {
  Meet,
  Member,
  Signup,
  SignupWithDetails,
  User,
} from '@cumc/shared-types';

interface HomeProps {
  user: User;
  member: Member;
}

const Home = ({ user }: HomeProps) => {
  const [member, setMember] = useState<false | Member>(false);
  const [link, setLink] = useState('https://www.cumc.org.uk/login');
  const [history, setHistory] = useState<Meet[]>([]);

  useEffect(() => {
    // Fetch Member Data
    axios.get('/api/member/').then(res => {
      if (res.data) setMember(res.data);
    });

    // Fetch Meet History
    axios.get('/api/meets/history').then(res => {
      if (res.data.length) {
        const sortedHistory = res.data
          .map((h: SignupWithDetails) => h.meet)
          .sort(
            (m: Meet, n: Meet) =>
              new Date(n.startDate).getTime() - new Date(m.startDate).getTime()
          );
        setHistory(sortedHistory);
      }
    });

    // Fetch WhatsApp Link
    axios.get('/api/about/whatsapp').then(res => {
      setLink(res.data);
    });
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Section: Carousel and Welcome Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="overflow-hidden border-none shadow-lg p-0 ">
            <Carousel slides={slides} />
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <Card className="flex flex-col h-full shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
              <CardDescription className="font-semibold text-primary">
                {user
                  ? `Signed in as ${user.displayName}`
                  : 'You are not signed in'}
              </CardDescription>
            </CardHeader>

            <CardContent className="grow">
              <div className="h-px bg-border mb-4" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {member && member.hasPaid
                  ? "You are a current member. Control your mailing preferences by clicking 'Profile' and then 'Mailing Lists'. Your recent meet history can be found below."
                  : 'Become a member today! ' +
                    (user ? 'Click' : 'Login and click') +
                    " on 'Profile' and then the 'Membership' tab."}
              </p>
            </CardContent>

            <CardFooter className="pt-0">
              {user ? (
                <div className="w-full">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                    Recent Signups
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Meet</TableHead>
                        <TableHead className="text-right font-bold">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length ? (
                        history.slice(0, 2).map((h, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {h.title}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {new Date(h.startDate).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="text-center py-4 text-muted-foreground italic"
                          >
                            None yet!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex gap-2 ml-auto">
                  <Button asChild variant="outline">
                    <NavLink to="/login">Register</NavLink>
                  </Button>
                  <Button asChild>
                    <NavLink to="/login">Login</NavLink>
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* About Section */}
      <AboutCard title="About Us" text={aboutText(link)} />

      {/* Image Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {homeImagesOne.map((img, key) => (
          <Card key={key} className="overflow-hidden group p-0">
            <img
              src={img}
              className="w-full h-auto object-cover transition-transform duration-500 "
              alt="Climbing"
            />
          </Card>
        ))}
      </div>

      {/* Membership Section */}
      <AboutCard title="Membership" text={membershipText} />

      {/* Image Row 2 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeImagesTwo.map((img, key) => (
          <Card key={key} className="overflow-hidden p-0">
            <img src={img} className="w-full h-auto" alt="Climbing" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeImagesThree.map((img, key) => (
          <Card key={key} className="overflow-hidden p-0">
            <img src={img} className="w-full h-auto" alt="Climbing" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
