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
import PayPalButtons from "../../../../components/PayPalButton/PayPalButtons";

class MeetForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            showPayment: false,
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
                if (cur.id && !["privacy", "participation", "data"].includes(cur.id)) {
                    acc.push({id: cur.id, value: cur.value});
                }
                return acc;
                // Avoid POSTing email, display name and checkboxes
            }, []);
            const data = {
                answers: answers,
                meetID: this.props.match.params.id
            };
            axios.post('/api/paypal/required', data).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0,0);
                } else if (res.data) {
                    // Payment required
                    this.setState({
                        showPayment: true,
                        data: data
                    });
                } else {
                    window.location.href = `/meets/upcoming/view/${this.props.match.params.id}`;
                    // Payment wasn't required
                }
            });
        }
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        if (this.state.meet.disabled || !this.props.user) {
            return (
                <Redirect to="/404"/>
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
                                        <hr />
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
                                            {this.state.meet.questions ? this.state.meet.questions.map(question => {
                                                return (
                                                    <Row>
                                                        <Col>
                                                            <Form.Group controlId={question.id}>
                                                                <Form.Label>{question.title}</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    required={question.required}
                                                                    placeholder={question.required ? "Required" : "Not Set"}
                                                                />
                                                                <Form.Text muted>
                                                                    {question.text}
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {question.help}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                )
                                            }) : null}
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Check
                                                            custom
                                                            type="checkbox"
                                                            id="data"
                                                            required
                                                            label="I have read, understand and agree to the club's data protection statement"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Check
                                                            custom
                                                            type="checkbox"
                                                            id="privacy"
                                                            required
                                                            label="I read, understand and agree to the club's safety policy"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Check
                                                            custom
                                                            type="checkbox"
                                                            id="participation"
                                                            required
                                                            label="I have read, understand and agree to the BMC participation statement"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <br /><br />
                                            <Row>
                                                <Col>
                                                    {this.state.showPayment ?
                                                        <div>
                                                            <Form.Label>Pay for Meet</Form.Label>
                                                            <div className="text-center">
                                                                <PayPalButtons
                                                                    price={this.state.meet.price}
                                                                    description={`Register for ${this.state.meet.title}`}
                                                                    intent='register'
                                                                    form={this.state.data}
                                                                    onSuccess={() =>
                                                                        window.location.href =
                                                                            `/meets/upcoming/view/${this.props.match.params.id}`
                                                                    }
                                                                    payer={{
                                                                        email_address: this.props.user.email
                                                                    }}
                                                                    onError={(err) => this.setState({
                                                                        err: err
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                        : <Button block type="submit">Submit</Button>
                                                    }
                                                </Col>
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