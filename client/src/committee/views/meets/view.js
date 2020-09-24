import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";

class ViewMeet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                user: {},
                questions: []
            },
        }
    }

    componentDidMount() {
        axios.post('/api/meets/view', {id: this.props.match.params.id}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
                window.scrollTo(0,0);
            } else {
                this.setState({
                    content: res.data
                });
            }
        });
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
                                    <Card.Title>Meet Administration</Card.Title>
                                    <Card.Subtitle>{this.state.content.title}</Card.Subtitle>
                                    <Card.Text as="span">
                                        <hr />

                                        <div className="text-muted" style={{display: 'inline'}}>Dates: </div>
                                        {new Date(this.state.content.startDate).toUTCString() + " "}-
                                        {" " + new Date(this.state.content.endDate).toUTCString()}
                                        <br />

                                        <div className="text-muted" style={{display: 'inline'}}>Organiser: </div>
                                        {this.state.content.user.firstName} {this.state.content.user.lastName}
                                        <br /><br />

                                        <h5 className="text-muted">Questions:</h5>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                            <tr>
                                                <th>Question</th>
                                                <th>Required?</th>
                                                <th>Description</th>
                                                <th>Help Text</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.state.content.questions.length
                                                ? this.state.content.questions.map((q, key) => {
                                                    return (
                                                        <tr key={key}>
                                                            {
                                                                [
                                                                    q.title, q.required.toString(), q.desc, q.help
                                                                ].map((e, key) => {
                                                                    return <td key={key}>{e}</td>;
                                                                })
                                                            }
                                                        </tr>
                                                    )
                                                }) : <tr><td className="text-center">Nothing here :(</td></tr>}
                                            </tbody>
                                        </Table>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Signups</Card.Title>
                                    <Card.Subtitle>
                                        Members currently signed up {this.state.content.title}
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            {
                                                [
                                                    "Name", "Created At"
                                                ].concat(this.state.content.questions.map(q => q.title))
                                                    .map((e, key) => {
                                                        return <th key={key}>{e}</th>
                                                    })
                                            }
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.signups && this.state.content.signups.length
                                            ? this.state.content.signups.map((mem, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                <NavLink to={`/committee/members/${mem.userID}`}>
                                                                    {mem.displayName}
                                                                </NavLink>,
                                                                new Date(mem.createdAt).toUTCString()
                                                            ].concat(mem.answers).map((e, key) => {
                                                                return <td key={key}>{e}</td>;
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            }) : <tr><td className="text-center">None yet!</td></tr>}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button block variant="success" href="/">Reimburse Drivers</Button>
                        </Col>
                        <Col>
                            <Button block href="/">Email Signups</Button>
                        </Col>
                        <Col>
                            <Button block variant="danger" href={`/committee/meets/edit/${this.props.match.params.id}`}>
                                Edit Meet</Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default ViewMeet;