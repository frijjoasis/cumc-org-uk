import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

import img1 from '../../../../assets/img/outdoor-1.jpg';
import img2 from '../../../../assets/img/outdoor-2.jpg';
import img3 from '../../../../assets/img/outdoor-3.jpg';

import { outdoorMeets } from './text';
import AboutCard from '../../../../components/AboutCard/AboutCard';

class OutdoorMeets extends React.Component {
  render() {
    return (
      <div className="content">
        <Container>
          <Row className="justify-content-center">
            <Col md={12}>
              <Card>
                <Image fluid src={img1} />
              </Card>
            </Col>
          </Row>
          <AboutCard
            title="Outdoor Meets"
            text={outdoorMeets}
            button={{ to: '/meets/upcoming', text: 'View Meets' }}
          />
          <Row className="justify-content-center">
            <Col md={6}>
              <Card>
                <Image fluid src={img2} />
                <Card.Footer className="text-center text-muted">
                  Sport climbing!
                </Card.Footer>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Image fluid src={img3} />
                <Card.Footer className="text-center text-muted">
                  Outdoor bouldering
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default OutdoorMeets;
