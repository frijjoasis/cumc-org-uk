import React from 'react';
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";

import Carousel from '../../../components/Carousel/Carousel';
import AboutCard from "../../../components/AboutCard/AboutCard";

import {aboutText, slides, membershipText, homeImages} from './text';
import {NavLink} from "react-router-dom";
import axios from "axios";
import Table from "react-bootstrap/Table";

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            member: false,
            history: []
        }
    }

    componentDidMount() {
        axios.get('/api/member/').then(res => {
            if (res.data) {
                this.setState(res.data)
            }
        });
        axios.get('/api/meets/history').then(res => {
           if (res.data.length) {
               this.setState({
                    history: res.data.map(h => h.meet)
               });
           }
        });
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
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>Welcome!</Card.Title>
                                    <Card.Subtitle>
                                        {this.props.user ? `You are signed in as ${this.props.user.displayName}`
                                            : "You are not signed in"}
                                    </Card.Subtitle>
                                    {this.state.member ?
                                        <Card.Text as="span"><hr />
                                            You are a current member.
                                            Control your mailing preferences by clicking 'Profile' and then 'Mailing Lists'.
                                            Your recent meet history can be found below.
                                        </Card.Text> :
                                        <Card.Text as="span">
                                        <hr />
                                            Become a member today! {this.props.user ? "Click" : "Login and click"} on
                                            'Profile' and then the 'Membership' tab.
                                            Control your mailing preferences by clicking 'Mailing Lists' instead.
                                        </Card.Text>
                                    }
                                </Card.Body>
                                <Card.Footer>
                                    {this.props.user ?
                                        <Table className="align-self-end" striped bordered hover responsive>
                                            <thead>
                                            <tr>
                                                <th key="recent">Recent Signups</th>
                                                <th key="date">Date</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.state.history.length ? this.state.history.map(h => {
                                                    return <tr>
                                                        <td>{h.title}</td>
                                                        <td>{new Date(h.startDate).toDateString()}</td>
                                                    </tr>;
                                            }) :
                                                <tr><td className="text-center" colSpan={2}>None yet!</td></tr>
                                            }
                                            </tbody>
                                        </Table> :
                                        [<NavLink style={{marginLeft: "10px"}}
                                            className="float-right btn btn-primary" to="/login">
                                        Login
                                        </NavLink>,
                                    <NavLink className="float-right btn btn-primary" to="/login">
                                        Register
                                    </NavLink>]}
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