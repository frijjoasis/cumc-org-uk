import React from 'react';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';
import { Slide } from '@/types/carousel';

interface PreparedCarouselProps {
    slides: Slide[]
}

class PreparedCarousel extends React.Component<PreparedCarouselProps> {
  render() {
    return (
      <Carousel>
        {this.props.slides.map((slide, key) => {
          return (
            <Carousel.Item key={key}>
              <Image
                className="d-block w-100"
                rounded
                src={slide.img}
                alt={slide.header}
              />
              <Carousel.Caption>
                <h3>{slide.header}</h3>
                <p>{slide.desc}</p>
              </Carousel.Caption>
            </Carousel.Item>
          );
        })}
      </Carousel>
    );
  }
}

export default PreparedCarousel;
