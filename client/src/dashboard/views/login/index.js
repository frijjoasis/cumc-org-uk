import React from 'react';
import axios from 'axios';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            err: false,
            form: {}
        }
    }

    componentDidMount() {
        axios.get('/api/user/info').then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
                window.scrollTo(0,0);
                // Scroll and show user the error
            } else {
                this.setState({
                    form: res.data
                });
            }
        });
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({validated: true})
        } else {
            const data = [...form.elements].reduce((acc, cur) => {
                if (cur.id) acc[cur.id] = cur.value;
                return acc;
                // Avoid POSTing email and display name
            }, {});
            console.log(data);
            axios.post('/api/user/register', data).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0,0);
                } else {
                    window.location.href = "http://localhost:3000/home"; //TODO:
                }
            });
        }
        event.preventDefault();
        event.stopPropagation();
    };

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Edit Profile</Card.Title>
                                    <Card.Subtitle>
                                        We require some information before you can sign up to meets
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
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="firstName">
                                                    <Form.Label>First Name(s)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        defaultValue={this.state.form.firstName}
                                                        placeholder="Required"
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your first name
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="lastName">
                                                    <Form.Label>Last Names(s)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Required"
                                                        defaultValue={this.state.form.lastName}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your last name
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="dob">
                                                    <Form.Label>Date of Birth</Form.Label>
                                                    <Form.Control type="date"
                                                                  required
                                                                  defaultValue={this.state.form.dob}
                                                    />
                                                    <Form.Text muted>
                                                        You must be 18+ to come on meets
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your D.O.B.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="college">
                                                    <Form.Label>College or Department</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        defaultValue={this.state.form.college}
                                                        placeholder="Required"
                                                        required
                                                    />
                                                    <Form.Text muted>
                                                        Primary emergency contact
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your college/department
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="phone">
                                                    <Form.Label>Mobile No.</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        defaultValue={this.state.form.phone}
                                                        placeholder="Required"
                                                        required
                                                    />
                                                    <Form.Text muted>
                                                        We use this to coordinate meets (departures, etc.)
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your phone number
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="address1">
                                                    <Form.Label>Address Line 1</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.address1}
                                                                  placeholder="Required"
                                                                  required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your address
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="address2">
                                                    <Form.Label>Address Line 2</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.address2}
                                                                  placeholder="Not Set"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={2}>
                                                <Form.Group controlId="postCode">
                                                    <Form.Label>Post Code / Zip</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.postCode}
                                                                  placeholder="Required"
                                                                  required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your post code
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={5}>
                                                <Form.Group controlId="city">
                                                    <Form.Label>City</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.city}
                                                                  placeholder="Not Set"

                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={5}>
                                                <Form.Group controlId="country">
                                                    <Form.Label>Country</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.country}
                                                                  placeholder="Required"
                                                                  required
                                                    />
                                                    <Form.Text muted>
                                                        Your address is required for insurance purposes
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        Please enter your country of residence
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="emergencyName">
                                                    <Form.Label>Additional Emergency Contact Name</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.emergencyName}
                                                                  placeholder="Not Set"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId="emergencyPhone">
                                                    <Form.Label>Additional Emergency Contact Number</Form.Label>
                                                    <Form.Control type="tel"
                                                                  defaultValue={this.state.form.emergencyPhone}
                                                                  placeholder="Not Set"
                                                    />
                                                    <Form.Text muted>
                                                        Optionally specify an additional emergency contact
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row>
                                            <Col>
                                                <Form.Group controlId="bmc">
                                                    <Form.Label>BMC Membership Number</Form.Label>
                                                    <Form.Control type="text"
                                                                  defaultValue={this.state.form.bmc}
                                                                  placeholder="Not Set"
                                                    />
                                                    <Form.Text muted>
                                                        Leave blank if unknown
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
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

export default Register;