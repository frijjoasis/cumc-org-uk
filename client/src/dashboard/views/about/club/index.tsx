import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, MapPin, Calendar, Medal } from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import img1 from '@/assets/img/theClub-1.jpg';
import img2 from '@/assets/img/theClub-2.jpg';
import { clubAbout, historyAbout } from './text';
import AboutCard from '@/components/AboutCard/AboutCard';

interface ProcessedRoute {
  date: string;
  name: string;
  climbers: string;
  description: string;
  grade: string;
  location: string;
}

const ClubAbout = () => {
  const [routes, setRoutes] = useState<ProcessedRoute[]>([]);

  useEffect(() => {
    axios.get('/api/about/routes').then(res => {
      const rawBody: string[][] = res.data?.body || [];
      const processed: ProcessedRoute[] = [];

      for (let i = 0; i < rawBody.length; i++) {
        const row = rawBody[i];
        if (row[0] !== '') {
          const nextRow = rawBody[i + 1];
          const secondNextRow = rawBody[i + 2];

          processed.push({
            date: row[0],
            name: row[1],
            grade: row[2],
            location: row[3],
            climbers: nextRow && nextRow[0] === '' ? nextRow[1] : '',
            description:
              secondNextRow && secondNextRow[0] === '' ? secondNextRow[1] : '',
          });
        }
      }
      setRoutes(processed);
    });
  }, []);

  return (
    <div className="space-y-8 pb-12 px-2 md:px-0">
      <AboutCard title="About CUMC" text={clubAbout} />

      {/* Hero Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="overflow-hidden border-none shadow-md">
          <img
            src={img1}
            className="w-full h-48 md:h-64 object-cover"
            alt="Club activity"
          />
          <div className="p-3 text-center text-xs md:text-sm font-bold text-zinc-700 bg-zinc-50 border-t">
            2022 CIC Hut Trip
          </div>
        </Card>
        <Card className="overflow-hidden border-none shadow-md">
          <img
            src={img2}
            className="w-full h-48 md:h-64 object-cover"
            alt="Club members"
          />
          <div className="p-3 text-center text-sm font-bold text-zinc-700 bg-zinc-50 border-t">
            Outdoor Secretary, Joe
          </div>
        </Card>
      </div>

      <AboutCard title="Club History" text={historyAbout} />

      {/* Responsive Routes Section */}
      <Card className="shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-white pb-4 border-b">
          <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight">
            New Routes
          </CardTitle>
          <p className="text-zinc-600 text-xs md:text-sm font-medium leading-snug">
            This is a list of some of the routes first climbed by CUMC members.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <TooltipProvider>
            {/* DESKTOP TABLE VIEW - Visible from 'md' breakpoint up */}
            <div className="hidden md:block">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead className="w-[12%] font-bold text-zinc-900">
                      Date
                    </TableHead>
                    <TableHead className="w-[53%] font-bold text-zinc-900">
                      Route & Climbers
                    </TableHead>
                    <TableHead className="w-[12%] font-bold text-zinc-900 text-center">
                      Grade
                    </TableHead>
                    <TableHead className="w-[23%] font-bold text-zinc-900">
                      Location
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route, idx) => (
                    <RouteItem key={idx} route={route} view="desktop" />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE LIST VIEW - Visible on small screens */}
            <div className="block md:hidden divide-y divide-zinc-100">
              {routes.map((route, idx) => (
                <RouteItem key={idx} route={route} view="mobile" />
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Component for Row/Card Logic
const RouteItem = ({
  route,
  view,
}: {
  route: ProcessedRoute;
  view: 'desktop' | 'mobile';
}) => {
  if (view === 'desktop') {
    return (
      <Collapsible asChild>
        <>
          <TableRow
            className={`align-top transition-colors ${route.description ? 'cursor-pointer hover:bg-zinc-50' : ''}`}
          >
            <TableCell className="text-xs font-bold text-zinc-500 pt-4 truncate">
              {route.date}
            </TableCell>
            <TableCell className="pt-4 overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="flex flex-col gap-1 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-zinc-900 text-base leading-tight">
                      {route.name}
                    </span>
                    {route.description && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ChevronDown className="h-4 w-4 shrink-0 text-primary group-data-[state=open]:rotate-180 transition-transform" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-xs font-bold">Notes</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 italic font-medium">
                    {route.climbers}
                  </div>
                </div>
              </CollapsibleTrigger>
            </TableCell>
            <TableCell className="text-center font-black text-primary text-sm pt-4">
              {route.grade}
            </TableCell>
            <TableCell className="text-zinc-600 text-xs font-medium pt-4 leading-tight">
              {route.location}
            </TableCell>
          </TableRow>
          {route.description && (
            <CollapsibleContent asChild>
              <TableRow className="bg-blue-50/20 border-l-4 border-l-primary/40">
                <TableCell colSpan={4} className="p-6">
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium italic">
                    {route.description}
                  </p>
                </TableCell>
              </TableRow>
            </CollapsibleContent>
          )}
        </>
      </Collapsible>
    );
  }

  // Mobile Card Version
  return (
    <Collapsible className="w-full">
      <div className="p-4 space-y-3">
        {/* Mobile Header: Date, Grade, Location */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {route.date}
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Medal className="h-3 w-3" />
            {route.grade}
          </div>
        </div>

        {/* Route Name and Climbers */}
        <CollapsibleTrigger className="w-full text-left group">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-black text-zinc-900 text-lg leading-tight">
                {route.name}
              </h4>
              <p className="text-xs text-zinc-500 italic font-medium mt-1">
                {route.climbers}
              </p>
            </div>
            {route.description && (
              <div className="bg-zinc-100 p-1.5 rounded-full group-data-[state=open]:bg-primary/10 transition-colors">
                <ChevronDown className="h-4 w-4 text-zinc-400 group-data-[state=open]:text-primary group-data-[state=open]:rotate-180 transition-transform" />
              </div>
            )}
          </div>
        </CollapsibleTrigger>

        {/* Location Tag */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 bg-zinc-100 w-fit px-2 py-0.5 rounded">
          <MapPin className="h-3 w-3" /> {route.location}
        </div>

        {route.description && (
          <CollapsibleContent className="pt-2">
            <div className="p-3 bg-blue-50/40 rounded-lg border-l-2 border-primary/30">
              <p className="text-xs text-zinc-700 leading-relaxed font-medium italic">
                {route.description}
              </p>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};

export default ClubAbout;
