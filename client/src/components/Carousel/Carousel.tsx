import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Slide } from '@/types/carousel';

interface PreparedCarouselProps {
  slides: Slide[];
}

const PreparedCarousel: React.FC<PreparedCarouselProps> = ({ slides }) => {
  return (
    <Carousel className="w-full group">
      <CarouselContent className="ml-0">
        {slides.map((slide, index) => (
          <CarouselItem key={index} className="pl-0 ">
            <div className="relative ">
              <img
                className="w-full rounded-lg"
                src={slide.img}
                alt={slide.header}
              />
              <div className="absolute bottom-0 text-center bg-black/30 left-0 right-0 text-white rounded-b-lg">
                <h3 className="px-10 text-xl font-semibold">{slide.header}</h3>
                <p className="px-10 text-sm">{slide.desc}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        variant="ghost"
        className="left-4 opacity-0! group-hover:opacity-100! group-hover:disabled:opacity-50! bg-white/20 rounded-full backdrop-blur-sm border-none text-white hover:bg-white/30 transition-all"
      />
      <CarouselNext
        variant="ghost"
        className="right-4 opacity-0! group-hover:opacity-100! group-hover:disabled:opacity-50! bg-white/20 border-none rounded-full backdrop-blur-sm text-white hover:bg-white/30 transition-all"
      />
    </Carousel>
  );
};

export default PreparedCarousel;
