import React from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import {NavLink} from "react-router-dom";

import img1 from '../../../../assets/img/upcoming-1.jpg';

class UpcomingMeets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: []
        }
    }

    componentDidMount() {
        axios.get("/api/meets/upcoming").then(res => {
            this.setState({
                content: res.data
            })
        })
    }

    sortMeets(m, n) {
        const mStart = new Date(m.startDate);
        const nStart = new Date(n.startDate);
        if (mStart === nStart) return 0;
        return mStart > nStart ? 1 : -1;
    }

    render() {
        return (
            <div className="content">
                {this.props.user ? null : <Alert variant="dark">
                    You will need to <NavLink to="/login">sign in</NavLink> and register before you can sign up to meets!
                </Alert>}
                <Container>
                    {this.state.content.filter(m => !m.hidden).length ?
                            this.state.content.sort(this.sortMeets).filter(m => !m.hidden).map(meet => {
                        return(
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{meet.title}</Card.Title>
                                            <Card.Subtitle>{meet.subtitle}</Card.Subtitle>
                                            <Card.Text as="span">
                                                <hr />

                                                <Row>
                                                    <Col>
                                                        <div className="text-muted" style={{display: 'inline'}}>Dates: </div>
                                                    {new Date(meet.startDate).toDateString() + " "}-
                                                    {" " + new Date(meet.endDate).toDateString()}
                                                    </Col>
                                                    <Col className="text-right">
                                                        <div className="text-muted" style={{display: 'inline'}}>Time: </div>
                                                        {new Date(meet.startDate).toLocaleTimeString().substr(0, 5) + " "}-
                                                        {" " + new Date(meet.endDate).toLocaleTimeString().substr(0, 5)}
                                                    </Col>
                                                </Row>

                                                <div className="text-muted" style={{display: 'inline'}}>Type: </div>
                                                {meet.type}
                                                <br />

                                                <div className="text-muted" style={{display: 'inline'}}>Signups open? </div>
                                                {meet.disabled ? "No" : "Yes"}
                                            </Card.Text>
                                        </Card.Body>
                                        <Card.Footer>
                                            <NavLink
                                                className="float-right btn btn-primary"
                                                to={`/meets/upcoming/view/${meet.id}`}>
                                                Details
                                            </NavLink>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            </Row>
                        );
                    }) : <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title className="text-center">
                                        No meets are currently running :(
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>}
                </Container>

                <Container>
                    <Row className="justify-content-center">
                        <Col>
                            <Card>
                                <Image src={img1} rounded fluid />
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default UpcomingMeets;
