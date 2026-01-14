import React from 'react';
import { Mountain, Compass, CalendarDays } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import img1 from '@/assets/img/outdoor-1.jpg';
import img2 from '@/assets/img/outdoor-2.jpg';
import img3 from '@/assets/img/outdoor-3.jpg';

import { outdoorMeets } from './text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const OutdoorMeets = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Hero Image Section */}
      <section className="relative h-[400px] md:h-[550px] overflow-hidden rounded-3xl shadow-2xl mx-4 lg:mx-0 group">
        <img
          src={img1}
          alt="Climbing Hero"
          className="w-full h-full object-cover transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8 md:p-12">
          <div className="text-white space-y-2">
            <Badge className="bg-primary hover:bg-primary border-none text-[10px] tracking-widest uppercase font-black italic">
              Experience the Rock
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              The Great Outdoors
            </h1>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <div className=" gap-12 px-4 lg:px-0 items-center">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
              Weekend Escapes
            </h2>
            <div className="h-1 w-20 bg-primary rounded-full" />
          </div>
          <div className="max-w-4xl text-zinc-600 leading-relaxed text-lg font-medium">
            {outdoorMeets.map((element, index) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-zinc-900 font-black uppercase italic tracking-widest gap-2"
            >
              <NavLink to="/meets/upcoming">
                <CalendarDays className="h-4 w-4" /> View Upcoming Meets
              </NavLink>
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Gallery Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 lg:px-0">
        <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg">
          <img
            src={img2}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt="Sport Climbing"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-black uppercase italic tracking-widest border-2 border-white px-6 py-2">
              Sport Climbing
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl transform translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-center font-bold text-zinc-900 uppercase text-xs">
              Pushing limits on the bolt
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg">
          <img
            src={img3}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt="Outdoor Bouldering"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-black uppercase italic tracking-widest border-2 border-white px-6 py-2">
              Bouldering
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl transform translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-center font-bold text-zinc-900 uppercase text-xs">
              Pebble wrestling at its finest
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OutdoorMeets;
