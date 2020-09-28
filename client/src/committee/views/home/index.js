import React from 'react';
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";

class CommitteeHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: []
        }
    }

    componentDidMount() {
        axios.get("/api/committee/current").then(res => {
            if (res.data.err) {
                this.setState({
                    err: res.data.err
                });
            } else this.setState({
                content: res.data
            });
        })
    }

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Committee Area</Card.Title>
                                    <Card.Subtitle>
                                        Welcome, {
                                            this.props.user ? this.props.user.displayName : "" // Account for slow DB
                                        }.
                                        Your committee role is {this.props.member ? this.props.member.committee : ""}.
                                        Below you can find the current committee.
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            {
                                                [
                                                    "Name", "Role"
                                                ].map((e, key) => {
                                                    return <th key={key}>{e}</th>
                                                })
                                            }
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.length
                                            ? this.state.content.map((c, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                `${c.user.firstName} ${c.user.lastName}`,
                                                                c.committee
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
                            <Button block variant="success"
                                    href="https://github.com/frijjoasis/cumc-org-uk/commits/master">
                                Recent Changes
                            </Button>
                        </Col>
                        <Col>
                            <Button block variant="danger"
                                    href="https://github.com/frijjoasis/cumc-org-uk">
                                View Code
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default CommitteeHome;