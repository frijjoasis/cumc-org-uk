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

    render() {
        return (
            <div className="content">
                {this.props.user ? null : <Alert variant="dark">
                    You will need to <NavLink to="/login">sign in</NavLink> and register before you can sign up to meets!
                </Alert>}
                <Container>
                    {this.state.content.length ? this.state.content.map(meet => {
                        return(
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{meet.title}</Card.Title>
                                            <Card.Subtitle>{meet.subtitle}</Card.Subtitle>
                                            <Card.Text as="span">
                                                <hr />

                                                <div className="text-muted" style={{display: 'inline'}}>Dates: </div>
                                                {new Date(meet.startDate).toUTCString()} -
                                                {new Date(meet.endDate).toISOString()}
                                                <br />

                                                <div className="text-muted" style={{display: 'inline'}}>Type: </div>
                                                {meet.type}
                                                <br />

                                                <NavLink
                                                    className="float-right btn btn-primary"
                                                    to={`/meets/upcoming/view/${meet.id}`}>
                                                    Details
                                                </NavLink>
                                            </Card.Text>
                                        </Card.Body>
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