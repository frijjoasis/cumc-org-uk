import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import img from '../../assets/img/404.jpg';

function Construction() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-6">
      {/* Image Card */}
      <div className="max-w-md w-full px-4">
        <Card className="overflow-hidden shadow-xl border-none p-0">
          <img
            src={img}
            alt="Under Construction"
            className="w-full h-auto object-cover"
          />
        </Card>
      </div>

      {/* Text Section - High Contrast */}
      <div className="text-center space-y-2 px-4">
        <h2 className="text-2xl font-bold text-zinc-900">Work in Progress</h2>
        <p className="text-zinc-700 font-medium">
          This page is currently under construction. Come back soon!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="font-bold border-zinc-300 text-zinc-700 hover:bg-zinc-100"
        >
          Go Back
        </Button>

        <Button asChild className="font-bold shadow-md">
          <Link to="/home">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default Construction;
