import React from 'react';
import axios from 'axios';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import PayPalButtons from "../../../components/PayPalButton/PayPalButtons";

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            err: false,
            form: {},
            member: {}
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
        axios.get('/api/member/').then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
                window.scrollTo(0,0);
            } else if (res.data.member) {
                this.setState({
                    member: res.data.member
                });
            } else {
                this.setState({
                    member: {hasFree: true}
                })
            }
        })
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
            axios.post('/api/user/register', data).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0,0);
                } else {
                    window.location.href = "/home";
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
                                <Tab.Container id="tabs-profile" defaultActiveKey="profile">
                                    <Card.Header>
                                        <Nav variant="tabs" defaultActiveKey="details" >
                                            <Nav.Item>
                                                <Nav.Link eventKey="profile">Profile</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="membership">Membership</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="mailing">Mailing Lists</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Header>
                                    <Card.Body>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="profile">
                                                <Card.Title>Edit Profile</Card.Title>
                                                <Card.Subtitle>
                                                    We require some information before you can sign up to meets
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
                                                    <br />
                                                    <Row>
                                                        <Col><Button block type="submit">Submit</Button></Col>
                                                    </Row>
                                                </Form>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="membership">
                                                <Card.Title>CUMC Membership</Card.Title>
                                                <Card.Subtitle>
                                                    In order to come on club meets, you must purchase membership. It
                                                    currently costs £25. Newcomers are entitled to one free meet before
                                                    purchasing.
                                                </Card.Subtitle>
                                                <hr />
                                                <Row>
                                                    <Col>
                                                        <Form.Group>
                                                            <Form.Label>Free Meet Status</Form.Label>
                                                            <Form.Control type="text"
                                                                          className={this.state.member.hasFree ?
                                                                              "text-success" : "text-danger"}
                                                                          readOnly
                                                                          value={this.state.member.hasFree ?
                                                                              "1 Remaining" : "0 Remaining"}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Form.Group>
                                                            <Form.Label>Membership Status</Form.Label>
                                                            <Form.Control type="text"
                                                                          className={this.state.member.hasPaid ?
                                                                              "text-success" : "text-danger"}
                                                                          readOnly
                                                                          value={this.state.member.hasPaid ?
                                                                              "Paid" : "Not Paid"}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        {true ? null :
                                                            <div>
                                                                <Form.Label>Purchase Membership</Form.Label>
                                                                <div className="text-center">
                                                                    <PayPalButtons
                                                                        price='25.00'
                                                                        description='Purchase Full Membership'
                                                                        intent='membership'
                                                                        onSuccess={() => window.location.href = "/home"}
                                                                        payer={{
                                                                            name: {
                                                                                given_name: this.state.form.firstName,
                                                                                surname: this.state.form.lastName
                                                                            },
                                                                            email_address: this.props.user.email
                                                                        }}
                                                                        onError={(err) => this.setState({
                                                                            err: err
                                                                        })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        }
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Card.Body>
                                </Tab.Container>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Register;