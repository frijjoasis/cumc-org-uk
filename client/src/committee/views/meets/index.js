import React from 'react';
import axios from "axios";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";

class MeetManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: [],
            archive: (this.props.location.pathname === '/committee/meets/archive')
        }
    }

    componentDidMount() {
        if (!this.state.archive) {
            axios.get("/api/meets/upcoming").then(res => {
                this.setState({
                    content: res.data
                });
            });
        } else {
            axios.get("/api/meets/all").then(res => {
                this.setState({
                    content: res.data
                });
            });
        }
    }

    render() {
        return (
            <div className="content">
                <Row>
                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{this.state.archive ? "Meets Archive" : "Upcoming Meets"}</Card.Title>
                                <Card.Subtitle>
                                    Here you can clone, edit and view upcoming meets. To view
                                    {this.state.archive ? " upcoming meets, click Upcoming. " : " past meets, click Meet Archive. "}
                                    To create an entirely new meet, click New. Admin such as paying drivers is done through the view window.
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
                                                            new Date(meet.endDate).toUTCString(),
                                                            <Row className="table-col">
                                                                <Col sm={3}>
                                                                    <NavLink to={`/committee/meets/view/${meet.id}`}>
                                                                        View</NavLink>
                                                                </Col>
                                                                <Col sm={3}>
                                                                    <NavLink to={`/committee/meets/edit/${meet.id}`}>
                                                                        Edit</NavLink>
                                                                </Col>
                                                                <Col sm={3}>
                                                                    <NavLink to={`/committee/meets/clone/${meet.id}`}>
                                                                        Clone</NavLink>
                                                                </Col>
                                                            </Row>
                                                        ].map((e, key) => {
                                                            return <td key={key}>{e}</td>;
                                                        })
                                                    }
                                                </tr>
                                            )
                                        }) : <tr><td className="text-center">Nothing here :(</td></tr>}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button block variant="success" href="/committee/meets/new">New</Button>
                    </Col>
                    <Col>
                        <Button block href={`/committee/meets/${this.state.archive ? "" : "archive"}`}>
                            {this.state.archive ? "Upcoming" : "Archive"}</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default MeetManager;