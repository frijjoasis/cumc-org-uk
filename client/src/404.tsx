import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Home, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Assuming these are renamed to follow a modern convention or kept as is
import img404 from './assets/img/404.jpg';
import imgNight from './assets/img/4041.jpg';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isNightClimbingEgg =
    location.pathname.toLowerCase().includes('night') &&
    location.pathname.toLowerCase().includes('climb');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        {/* The Visual Stage */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-[2rem] rotate-1 group">
          <CardContent className="p-0 relative">
            <img
              src={isNightClimbingEgg ? imgNight : img404}
              alt="Not Found"
              className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                  Error Code
                </p>
                <h2 className="text-5xl font-black italic">404</h2>
              </div>
              <Compass className="text-primary h-12 w-12 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Messaging */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
            Off Route
          </h1>
          <p className="text-zinc-500 font-medium italic">
            "Are you sure that{' '}
            <span className="text-zinc-900 font-bold">
              {isNightClimbingEgg ? 'society' : 'page'}
            </span>{' '}
            exists?"
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto border-zinc-200 hover:border-zinc-900 font-black uppercase italic tracking-widest gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Go Back
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-zinc-900 text-white font-black uppercase italic tracking-widest gap-2 shadow-xl hover:shadow-primary/20"
          >
            <Link to="/home">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
