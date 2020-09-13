import React from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
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
                <Container>
                    {this.state.content ? this.state.content.map(meet => {
                        return(
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{meet.title}</Card.Title>
                                            <Card.Subtitle>{meet.desc}</Card.Subtitle>
                                            <Card.Text as="span">
                                                <hr />
                                                <div className="text-muted" style={{display: 'inline'}}>Date: </div>
                                                {new Date(meet.date).toUTCString()}<br />
                                                <div className="text-muted" style={{display: 'inline'}}>Signups: </div>
                                                {meet.members}
                                                <NavLink className="float-right btn btn-primary" to="/login">
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