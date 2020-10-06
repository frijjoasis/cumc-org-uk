import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";

import img from '../../../../assets/img/competitions-1.jpg'

import {competitionsAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

class CompetitionsAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8}>
                            <Card>
                                <Image src={img} fluid />
                                <Card.Footer className="text-center text-muted">Varsity 2020</Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                    <AboutCard title="Competitions" text={competitionsAbout} />
                </Container>
            </div>
        )
    }
}

export default CompetitionsAbout;