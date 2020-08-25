import React from "react";
import Image from "react-bootstrap/Image";
import Carousel from "react-bootstrap/Carousel";

class PreparedCarousel extends React.Component {
    render() {
        return (
            <Carousel>
                {this.props.slides.map(slide => {
                    return (
                        <Carousel.Item>
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