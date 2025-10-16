import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

import img1 from '@assets/img/competitions-1.jpg';
import img2 from '@assets/img/competitions-2.jpg';
import img3 from '@assets/img/competitions-3.jpg';

import { competitionsAbout } from './text';
import AboutCard from '@/components/AboutCard/AboutCard';

class CompetitionsAbout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: false,
    };
  }

  render() {
    return (
      <div className="content">
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              <Card>
                <Image src={img1} fluid />
                <Card.Footer className="text-center text-muted">
                  Our competitions team training hard
                </Card.Footer>
              </Card>
            </Col>
          </Row>
          <AboutCard title="Competitions" text={competitionsAbout} />
          <Row className="justify-content-center">
            <Col md={6}>
              <Card>
                <Image src={img2} fluid />
                <Card.Footer className="text-center text-muted">
                  LUBE 2022
                </Card.Footer>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Image src={img3} fluid />
                <Card.Footer className="text-center text-muted">
                  Tilly and Lauren crushing in team training
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default CompetitionsAbout;
