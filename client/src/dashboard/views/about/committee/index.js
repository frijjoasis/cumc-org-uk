import React from 'react';
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import UserCard from '../../../../components/UserCard/UserCard';

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";

import {committee} from "./committee";

class CommitteeAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                head: [],
                body: [],
            }
        }
    }

    componentDidMount() {
        axios.get("/api/committee/past").then(res => {
            this.setState({
                content: res.data,
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row className="justify-content-md-center">
                        <Col sm={3}>
                            <UserCard person={committee.treasurer} />
                        </Col>
                        <Col sm={3}>
                            <UserCard person={committee.president} />
                        </Col>
                        <Col sm={3}>
                            <UserCard person={committee.secretary} />
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        {committee.indoorMeets.map((i, key) => {
                            return (
                                <Col key={key}>
                                    <UserCard person={i} />
                                </Col>
                            )
                        })}
                        {committee.outdoorMeets.map((i, key) => {
                            return (
                                <Col key={key}>
                                    <UserCard person={i} />
                                </Col>
                            )
                        })}
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col>
                            <UserCard person={committee.gear} />
                        </Col>
                        <Col>
                            <UserCard person={committee.competitions} />
                        </Col>
                        <Col>
                            <UserCard person={committee.webmaster} />
                        </Col>
                        <Col>
                            <UserCard person={committee.winterMeets} />
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        {committee.socialMeets.map((i, key) => {
                            return (
                                <Col md={3} key={key}>
                                    <UserCard person={i} />
                                </Col>
                            )
                        })}
                        <Col md={3}>
                            <UserCard person={committee.journal} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Past Committees</Card.Title>
                                    <Card.Subtitle>
                                        Here you can find the committees of years past.
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover>
                                        <div style={{fontSize: 9}}>{/*can't get responsive table to work inside card*/}
                                            <thead>
                                            <tr>
                                                {this.state.content.head.map((prop, key) => {
                                                    return <th key={key}>{prop}</th>;
                                                })}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.content.body.map((prop, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {prop.map((prop, key) => {
                                                            return <td key={key}>{prop}</td>;
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </div>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default CommitteeAbout;