import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

import {gearAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

class GearAbout extends React.Component {
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
        axios.get("/api/gear/list").then(res => {
            this.setState({
                content: res.data
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <AboutCard title="Gear" text={gearAbout} button={
                        {
                            type: "button",
                            to: "https://docs.google.com/spreadsheets/d/1CD4WMZ0-YO_ki2htINSFLYlZnkNZbJTNwkMwCX5cu38",
                            text: "Gear Spreadsheet"
                        }
                    } />
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Gear Table</Card.Title>
                                    <Card.Subtitle>
                                        The loan status of club owned gear.
                                    </Card.Subtitle>
                                    <hr />
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

export default GearAbout;