import React from 'react';
import axios from 'axios';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";

import {clubAbout, historyAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

class ClubAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                head: ["Date", "Climbers", "Name", "Grade", "Location"],
                body: [],
            },
        }
    }

    componentDidMount() {
        axios.get("/api/about/routes").then(res => {
            this.setState({
                content: res.data,
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <AboutCard title="About CUMC" text={clubAbout} />
                    <AboutCard title="Club History" text={historyAbout} />
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>New Routes</Card.Title>
                                    <Card.Subtitle>
                                        This is a list of some of the routes first climbed by CUMC members.
                                    </Card.Subtitle>
                                    <Table striped bordered hover responsive>
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

export default ClubAbout;