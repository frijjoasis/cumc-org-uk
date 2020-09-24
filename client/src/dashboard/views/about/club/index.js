import React from 'react';
import axios from 'axios';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";

import img from "../../../../assets/img/logo.png";

import {clubAbout, historyAbout} from "./text";

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
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>About CUMC</h2>
                                    {clubAbout}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col style={{flex: 0}}>
                            <Card>
                                <Image className="logo-cumc" rounded src={img} />
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Club History</h2>
                                    {historyAbout}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card ctTableFullWidth ctTableResponsive>
                                <Card.Body>
                                    <Card.Title>New Routes</Card.Title>
                                    <Card.Subtitle>
                                        This is a list of some of the routes first climbed by CUMC members.
                                    </Card.Subtitle>
                                    <Table striped hover>
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