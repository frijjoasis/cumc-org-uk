import React from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import {NavLink} from "react-router-dom";

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
                    {this.state.content.length ? this.state.content.sort(this.sortMeets).map(meet => {
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
                            <p className="text-center">No meets are currently running :(</p>
                        </Col>
                    </Row>}
                </Container>
            </div>
        )
    }
}

export default UpcomingMeets;