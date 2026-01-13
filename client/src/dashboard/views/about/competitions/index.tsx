import React from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { competitionsAbout } from './text';
import AboutCard from '@/components/AboutCard/AboutCard';

// Assets
import img1 from '@/assets/img/competitions-1.jpg';
import img2 from '@/assets/img/competitions-2.jpg';
import img3 from '@/assets/img/competitions-3.jpg';

const CompetitionsAbout = () => {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto px-4 md:px-0">
      {/* Featured Header Image */}
      <div className="flex justify-center">
        <Card className="w-full md:w-5/6 overflow-hidden border-none shadow-lg p-0 gap-0">
          <img
            src={img1}
            alt="Competitions team training"
            className="w-full object-cover"
          />
          <CardFooter className="bg-zinc-50 py-3 text-center justify-center text-xs md:text-sm font-bold text-zinc-600 border-t">
            Our competitions team training hard
          </CardFooter>
        </Card>
      </div>

      {/* Main Content - Note: Wrapping in a div to handle the array of elements */}
      <div className="prose prose-zinc max-w-none prose-h3:text-2xl prose-h3:font-black prose-h3:uppercase prose-h3:tracking-tight prose-h3:mt-8 prose-h3:mb-4">
        <AboutCard
          title="Competitions"
          text={
            <div className="space-y-4">
              {competitionsAbout.map((element, index) => (
                <React.Fragment key={index}>{element}</React.Fragment>
              ))}
            </div>
          }
        />
      </div>

      {/* Secondary Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-none shadow-md p-0 gap-0">
          <img src={img2} alt="LUBE 2022" className="w-full  object-cover" />
          <CardFooter className="bg-zinc-50 py-3 text-center justify-center text-sm font-bold text-zinc-600 border-t">
            LUBE 2022
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-none shadow-md p-0 gap-0">
          <img
            src={img3}
            alt="Team training"
            className="w-full  object-cover"
          />
          <CardFooter className="bg-zinc-50 py-3 text-center justify-center text-sm font-bold text-zinc-600 border-t">
            Tilly and Lauren crushing in team training
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CompetitionsAbout;
