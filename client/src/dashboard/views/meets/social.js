import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {NavLink} from "react-router-dom";
import Image from "react-bootstrap/Image";

import img from "../../../assets/img/social-1.jpg";

const socialMeets = [
    "The club has it's weekly social at a local pub, usually somewhere with a good ale selection, straight after the " +
    "weekly Rainbow Rocket meet on a Monday night. We head to the pub around 9pm, so listen out for the Call to Beer " +
    "if you're in Rainbow Rocket, or feel free to meet us at the pub if not! Look out for the weekly email which " +
    "will let you know which pub we'll be at. As well as this, there are frequent extra social events throughout the " +
    "year, such as our christmas formal, annual dinner and swaps with other societies."
];

class SocialMeets extends React.Component {
    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Social Meets</h2>
                                    <p>{socialMeets}</p>
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
                                            ~something social~
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

export default SocialMeets;