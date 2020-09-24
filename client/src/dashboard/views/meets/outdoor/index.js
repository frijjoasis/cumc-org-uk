import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {NavLink} from "react-router-dom";
import Image from "react-bootstrap/Image";

import img from "../../../../assets/img/outdoor-1.jpg";

import {outdoorMeets} from "./text";

class OutdoorMeets extends React.Component {
    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Outdoor Meets</h2>
                                    {outdoorMeets}
                                    <Row>
                                        <Col>
                                            <NavLink className="float-right btn btn-primary" to="/meets/upcoming">
                                                View Meets
                                            </NavLink>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            <Row className="justify-content-center">
                                <Col style={{flex: 0}}>
                                    <Card>
                                        <Image src={img} />
                                        <Card.Footer className="text-center text-muted">
                                            ~something outdoors~
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default OutdoorMeets;