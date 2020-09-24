import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {NavLink} from "react-router-dom";
import Image from "react-bootstrap/Image";

import img from "../../../../assets/img/indoor-1.jpg";

import {indoorMeets} from "./text";

class IndoorMeets extends React.Component {
    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Indoor Meets</h2>
                                    {indoorMeets}
                                    <Row>
                                        <Col>
                                            <NavLink className="float-right btn btn-primary" to="/meets/upcoming">View Meets</NavLink>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            <Row className="justify-content-center">
                                <Col style={{flex: 0}}>
                                    <Card>
                                        <Image src={img} />
                                        <Card.Footer className="text-center text-muted">~something indoors~</Card.Footer>
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

export default IndoorMeets;