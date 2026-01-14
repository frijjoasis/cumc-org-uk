import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, PartyPopper, Coffee, CalendarDays } from 'lucide-react';

import img from '@/assets/img/social-1.jpg';
import { socialMeets } from './text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SocialMeets = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-16 px-4 lg:px-0">
      
      {/* Editorial Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
        <div className="order-2 lg:order-1 space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="border-zinc-200 text-zinc-500 font-mono uppercase text-[10px] tracking-widest px-3">
              Community & Culture
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
              Beyond the <span className="text-primary">Crag</span>
            </h1>
          </div>
          
          <div className="space-y-6">
            <p className="text-zinc-600 leading-relaxed text-lg font-medium whitespace-pre-line">
              {socialMeets}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="bg-zinc-900 font-black uppercase italic tracking-widest gap-2 h-12">
                <NavLink to="/meets/upcoming">
                  <CalendarDays className="h-4 w-4" /> Discover Socials
                </NavLink>
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Image with Polaroid Style */}
        <div className="order-1 lg:order-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-zinc-900 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white p-3 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100">
              <img 
                src={img} 
                alt="Club Social Event" 
                className="w-full h-auto rounded-xl object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="pt-4 pb-2 px-2 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Archive: Winter Sun 2019
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Pillars Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {[
          { 
            icon: Users, 
            title: "Weekly Pub Nights", 
            desc: "The heartbeat of the club. Every Tuesday after the wall session." 
          },
          { 
            icon: Coffee, 
            title: "Cafe Catch-ups", 
            desc: "Planning the next big trip over local coffee and route guides." 
          },
          { 
            icon: PartyPopper, 
            title: "Annual Dinners", 
            desc: "The big one. Dressing up to celebrate a year of summits." 
          }
        ].map((pillar, i) => (
          <div key={i} className="group p-8 bg-zinc-50 rounded-3xl border border-transparent hover:border-zinc-200 hover:bg-white transition-all duration-300">
            <div className="mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:shadow-md transition-shadow">
              <pillar.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{pillar.title}</h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
};

export default SocialMeets;