import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Alert from "react-bootstrap/Alert";
import MembershipChanger from "../../../components/MembershipChanger/MembershipChanger";

class Webmaster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: [],
            err: null,
            success: null
        }
    }

    componentDidMount() {
        this.refreshData(null, null);
        this.setState({
            filter: ""
        });
    }

    refreshData(error, success) {
        axios.get("/api/user/list").then(res => {
            this.setState({
                err: error,
                success: success,
                content: res.data,
            });
        });
    }

    handleChange(e) {
        this.setState({
            filter: e.target.value
        });
    }

    resetMemberships() {
        axios.get('/api/member/reset').then(res => {
            if (res.data.err) {
                this.setState({
                    err: res.data.err
                });
            } else {
                this.setState({
                    success: "Memberships reset. Please refresh to see the changes."
                });
            }
        });
    }

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                {this.state.success ? <Alert variant="success">{this.state.success}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Webmaster Area</Card.Title>
                                    <Card.Subtitle>
                                        Welcome, {
                                        this.props.user ? this.props.user.displayName : "" // Account for slow DB
                                    }.
                                        You {this.props.member && this.props.member.committee === "root" ?
                                        <span style={{color: 'green'}}>do</span> : <span style={{color: 'red'}}>do not</span>}
                                        {" "} have permission to use the features of this page.
                                    </Card.Subtitle>
                                    <hr />
                                    <Button onClick={() => this.resetMemberships()} block variant="danger" className="btn-fill" style={{fontWeight: 'bold'}}>
                                        Reset ALL Memberships (GABE DO NOT TOUCH)</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Edit Committee</Card.Title>
                                    <Card.Subtitle>
                                        Here you can update committee roles
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
                                                    "Name", "Role", "Paid?"
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
                                                                u.member ? u.member.committee : "",
                                                                <MembershipChanger
                                                                    callback={this.refreshData.bind(this)}
                                                                    default={u.member && u.member.hasPaid}
                                                                    id={u.id}
                                                                />
                                                            ].map((e, key) => {
                                                                return <td key={key}>{e}</td>;
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            }) : <tr><td colSpan={4} className="text-center">Nothing here :(</td></tr>}
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

export default Webmaster;