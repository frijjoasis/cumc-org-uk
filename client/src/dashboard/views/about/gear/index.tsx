import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { gearAbout } from './text';
import AboutCard from '@/components/AboutCard/AboutCard';
import img from '@/assets/img/gear-1.jpg';

const GearAbout = () => {
  return (
    <div className="space-y-10 pb-12 max-w-5xl mx-auto px-4 md:px-0">
      {/* Main Content & External Spreadsheet Link */}
      <AboutCard
        title="Club Gear"
        text={
          <div className="space-y-4">
            {gearAbout.map((element, index) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </div>
        }
        button={{
          type: 'button',
          to: 'https://docs.google.com/spreadsheets/d/1CD4WMZ0-YO_ki2htINSFLYlZnkNZbJTNwkMwCX5cu38',
          text: 'View Gear Spreadsheet',
        }}
      />

      {/* Hero Gear Image */}
      <div className="flex justify-center">
        <Card className="w-full md:w-3/4 overflow-hidden border-none shadow-2xl transition-transform hover:scale-[1.01]">
          <img
            src={img}
            alt="Club climbing gear"
            className="w-full h-auto object-cover"
          />
          <div className="bg-zinc-900 text-white py-3 text-center text-xs font-black uppercase tracking-widest italic">
            A selection of CUMC's trad and sport climbing rack
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GearAbout;
