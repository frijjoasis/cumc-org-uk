import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import {NavLink} from "react-router-dom";

class Members extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: []
        }
    }

    componentDidMount() {
        axios.get("/api/user/list").then(res => {
            this.setState({
                content: res.data,
                filter: ""
            });
        });
    }

    handleChange(e) {
        this.setState({
            filter: e.target.value
        });
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>List of Members</Card.Title>
                                    <Card.Subtitle>
                                        A list of members who have signed up to the website.
                                        The table shows if they have paid for this year. View member details by
                                        clicking their name.
                                    </Card.Subtitle>
                                    <hr />
                                    <Form.Group>
                                        <Form.Label>Search</Form.Label>
                                        <FormControl type="text" onChange={this.handleChange.bind(this)}
                                                     placeholder="Type 'paid' to see only paid up members" />
                                    </Form.Group>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            {
                                                [
                                                    "Name", "College", "Paid?"
                                                ].map((e, key) => {
                                                    return <th key={key}>{e}</th>
                                                })
                                            }
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.length
                                            ? this.state.content.filter(u =>
                                                `${u.firstName} ${u.lastName}`.toLowerCase()
                                                    .includes(this.state.filter.toLowerCase()) ||
                                                (u.college && u.college.toLowerCase()
                                                    .includes(this.state.filter.toLowerCase())) ||
                                                u.displayName.toLowerCase()
                                                    .includes(this.state.filter.toLowerCase()) ||
                                                (this.state.filter === "paid" && u.member && u.member.hasPaid)
                                            ).map((u, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                <NavLink to={`/committee/members/${u.id}`}>
                                                                    {u.firstName ? `${u.firstName} ${u.lastName}` :
                                                                        u.displayName}
                                                                </NavLink>,
                                                                u.college,
                                                                (u.member && u.member.hasPaid) ? <div className="text-success">Yes</div>
                                                                    : <div className="text-danger">No</div>,
                                                            ].map((e, key) => {
                                                                return <td key={key}>{e}</td>;
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            }) : <tr><td colSpan={3} className="text-center">Nothing here :(</td></tr>}
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

export default Members;