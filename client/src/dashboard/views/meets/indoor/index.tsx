import React from 'react';
import { Card, CardFooter, CardContent } from '@/components/ui/card';
import { indoorMeets } from './text';
import AboutCard from '@/components/AboutCard/AboutCard';

// Assets
import img from '@/assets/img/indoor-1.jpg';

const IndoorMeets = () => {
  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto px-4 md:px-0">
      {/* Main Content Card */}
      <AboutCard
        title="Indoor Meets"
        text={
          <div className="space-y-4 legacy-text-render">
            {indoorMeets.map((element, index) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </div>
        }
        button={{
          to: '/meets/upcoming',
          text: 'View Meets',
        }}
      />

      {/* Featured Image */}
      <div className="flex justify-center">
        <Card className="w-full md:w-10/12 overflow-hidden border-none shadow-2xl ">
          <img
            src={img}
            alt="Hugo on an auto-belay"
            className="w-full h-64 md:h-[500px] object-cover"
          />
          <CardFooter className="bg-zinc-900 text-white py-4 text-center justify-center text-xs font-black uppercase tracking-widest italic">
            Hugo stares down an auto-belay
          </CardFooter>
        </Card>
      </div>

      {/* CSS Reset for the text array */}
      <style>{`
        .legacy-text-render p {
          color: #52525b; /* zinc-600 */
          line-height: 1.75;
          font-weight: 500;
        }
        .legacy-text-render br {
          display: block;
          margin-top: 1rem;
          content: "";
        }
      `}</style>
    </div>
  );
};

export default IndoorMeets;
