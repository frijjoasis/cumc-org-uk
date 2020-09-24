import React from 'react';
import axios from 'axios';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import {Redirect} from "react-router-dom";

class MeetForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            err: false,
            meet: {}
        }
    }

    componentDidMount() {
        axios.post('/api/meets/view', {id: this.props.match.params.id}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
                window.scrollTo(0,0);
            } else {
                this.setState({
                    meet: res.data
                });
            }
        });
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({validated: true})
        } else {
            const answers = [...form.elements].reduce((acc, cur) => {
                if (cur.id) acc[cur.id] = cur.value;
                return acc;
                // Avoid POSTing email and display name
            }, []);
            const data = {
                answers: answers,
                meetID: this.props.match.params.id
            }; //TODO: Back this with a payment token
            axios.post('/api/meets/register', data).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0,0);
                } else {
                    window.location.href = `/meets/upcoming/view/${this.props.match.params.id}`;
                }
            });
        }
        event.preventDefault();
        event.stopPropagation();
    };

    render() {
        if (this.state.meet.disabled) {
            return (
                <Redirect to="/404" />
            )
        }
        else if (!this.props.user) {
            return (
                <Redirect to="/login" />
            )
        } else {
            return (
                <div className="content">
                    {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                    <Container>
                        <Row>
                            <Col>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Register for {this.state.meet.title}</Card.Title>
                                        <Card.Subtitle>
                                            Please fill out the form below
                                        </Card.Subtitle>
                                        <br />
                                        <Form noValidate
                                              validated={this.state.validated}
                                              onSubmit={this.handleSubmit.bind(this)}
                                        >
                                            <Row>
                                                <Col md={8}>
                                                    <Form.Group>
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control type="email"
                                                                      readOnly
                                                                      value={this.props.user.email}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Display Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            readOnly
                                                            value={this.props.user.displayName}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            {this.state.meet.questions ? this.state.meet.questions.map((question, i) => {
                                                return (
                                                    <Row>
                                                        <Col>
                                                            <Form.Group controlId={i}>
                                                                <Form.Label>{question.title}</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    required={question.required}
                                                                    placeholder={question.required ? "Required" : "Not Set"}
                                                                />
                                                                <Form.Text muted>
                                                                    {question.desc}
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {question.help}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                )
                                            }) : null}
                                            <br /><br />
                                            <Row>
                                                <Col><Button block type="submit">Submit</Button></Col>
                                            </Row>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            )
        }
    }
}

export default MeetForm;