import React from 'react';
import Container from "react-bootstrap/Container";

import {safetyAbout} from "./safety";
import {dataAbout} from "./privacy";
import {constitutionAbout} from "./constitution";
import {covidAbout} from "./covid";

import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";

class DocumentsAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Tab.Container id="tabs-documents" defaultActiveKey="safety">
                                    <Card.Header>
                                        <Nav variant="tabs" defaultActiveKey="details" >
                                            <Nav.Item>
                                                <Nav.Link eventKey="safety">Safety Policy</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="privacy">Privacy Policy</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="constitution">Constitution</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="covid">COVID</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Header>
                                    <Card.Body>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="safety">
                                                <Card.Title>Safety Policy</Card.Title>
                                                <Card.Subtitle>How the club keeps you safe</Card.Subtitle>
                                                <Card.Text as="span">
                                                    <hr />
                                                    {safetyAbout}
                                                </Card.Text>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="privacy">
                                                <Card.Title>Privacy Policy</Card.Title>
                                                <Card.Subtitle>How we use your personal information</Card.Subtitle>
                                                <Card.Text as="span">
                                                    <hr />
                                                    {dataAbout}
                                                </Card.Text>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="constitution">
                                                <Card.Text as="span">
                                                    {constitutionAbout}
                                                </Card.Text>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="covid">
                                                <Card.Text as="span">
                                                    <hr />
                                                    {covidAbout}
                                                </Card.Text>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Card.Body>
                                </Tab.Container>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default DocumentsAbout;