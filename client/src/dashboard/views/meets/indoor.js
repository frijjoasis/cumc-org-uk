import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {NavLink} from "react-router-dom";
import Image from "react-bootstrap/Image";

import img from "../../../assets/img/indoor-1.jpg";

const indoorMeets = [
    "Every Friday evening we run a trip to a nearby indoor wall, this is your chance to get on a rope inside or just " +
    "to do some extra bouldering. We rotate between a selection of walls around an hour's drive away (usually The " +
    "Pinnacle in Northampton, Big Rock in Milton Keynes and XC in Hemel Hempstead). They all have excellent leading, " +
    "top roping and bouldering so there's something for everyone. We leave from Cambridge at around 6pm and usually " +
    "climb to closing time so get back around 11pm.",
    <br />, <br />,
    "To come sign up on the website. This opens on a Monday when the president sends out the weekly bulletin. Any " +
    "club member can come on an indoor meet. This year indoor meets cost £6 which is used to refund drivers at a " +
    "rate of 25p per mile, which covers fuel plus 'wear and tear'. This doesn't cover the cost of entry to the wall! " +
    "If you have your place on a meet confirmed then find you can't come email the organiser BEFORE 10AM on the " +
    "Friday and they will refund you. No refunds will be given after this time except in exceptional circumstances. " +
    "If the entire meet is cancelled then everyone will be refunded.",
];

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
                                    <p>{indoorMeets}</p>
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