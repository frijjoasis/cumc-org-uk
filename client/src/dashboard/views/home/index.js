import React from 'react';
import axios from 'axios';
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";

import Carousel from '../../../components/Carousel/Carousel';
import AboutCard from "../../../components/AboutCard/AboutCard";

import {aboutText, slides, membershipText, homeImages} from './text';
import {NavLink} from "react-router-dom";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    componentDidMount() {
        axios.get('/api/index').then(res => {
            this.setState({
                content: res.data,
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container fluid>
                    <Row>
                        <Col md={8}>
                            <Card>
                                <Carousel slides={slides} />
                            </Card>
                        </Col>
                        <Col md={4} className="d-flex flex-column">
                            <Card className="flex-grow-1">
                                <Card.Body>
                                    <Card.Title>Welcome!</Card.Title>
                                    <Card.Subtitle>
                                        {this.props.user ? `You are signed in as ${this.props.user.displayName}`
                                            : "You are not signed in"}
                                    </Card.Subtitle>
                                    <Card.Text as="span">
                                        <hr />
                                        Become a member today! Click on 'Profile' and then the 'Membership' tab.
                                        Purchasing membership is temporarily disabled while we sort out a payment issue.
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <NavLink style={{marginLeft: "10px"}}
                                            className="float-right btn btn-primary" to="/login">
                                        Login
                                    </NavLink>
                                    <NavLink className="float-right btn btn-primary" to="/login">
                                        Register
                                    </NavLink>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                    <AboutCard title="About Us" text={aboutText} />
                    <Row>
                        {homeImages.map((i, key) => {
                            return (
                                <Col key={key}>
                                    <Card>
                                        <Image
                                            className="d-block w-100"
                                            rounded
                                            src={i}
                                        />
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                    <AboutCard title="Membership" text={membershipText} />
                </Container>
            </div>
        )
    }
}

export default Home;