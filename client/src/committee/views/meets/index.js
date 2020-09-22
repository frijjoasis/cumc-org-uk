import React from 'react';
import axios from "axios";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import {NavLink} from "react-router-dom";

class MeetManager extends React.Component {
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
            });
        });
    }

    render() {
        return (
            <div className="content">
                <Row>
                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Upcoming Meets</Card.Title>
                                <Card.Subtitle>
                                    Here you can clone, edit and view upcoming meets. To view past meets, click Meet Archive. To create an entirely new meet, click New.
                                </Card.Subtitle>
                                <hr />
                                <Table striped bordered hover responsive>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Admin</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.content.length
                                        ? this.state.content.map((meet, key) => {
                                            return (
                                                <tr key={key}>
                                                    {
                                                        [
                                                            meet.title,
                                                            meet.type,
                                                            new Date(meet.startDate).toUTCString(),
                                                            new Date(meet.endDate).toUTCString()
                                                        ].map((e, key) => {
                                                            return <td key={key}>{e}</td>;
                                                        })
                                                    }
                                                </tr>
                                            )
                                        }) : <tr><td className="text-center">No upcoming meets.</td></tr>}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <NavLink className="btn btn-block btn-success float-right" to="/home">
                            New</NavLink>
                    </Col>
                    <Col>
                        <NavLink className="btn btn-block btn-primary float-left" to="/home">
                            Archive</NavLink>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default MeetManager;