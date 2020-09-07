import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Edit Profile</Card.Title>
                                    <Card.Subtitle>
                                        We require some information before you can sign up to meets
                                    </Card.Subtitle>
                                    <Card.Text>
                                        <br />
                                        <Form>
                                            <Row>
                                                <Col md={8}>
                                                    <Form.Group>
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control type="email"
                                                                      readOnly
                                                                      placeholder={this.props.user}
                                                        />
                                                    </Form.Group>
                                                </Col><Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Display Name</Form.Label>
                                                        <Form.Control type="text" readOnly placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>First Name(s)</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col><Col>
                                                    <Form.Group>
                                                        <Form.Label>Last Names(s)</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <br />
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Date of Birth</Form.Label>
                                                        <Form.Control type="date" />
                                                        <Form.Text muted>
                                                            Required for BMC insurance
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col><Col>
                                                    <Form.Group>
                                                        <Form.Label>College or Department</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                        <Form.Text muted>
                                                            Primary emergency contact
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col><Col>
                                                    <Form.Group>
                                                        <Form.Label>Mobile No.</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                        <Form.Text muted>
                                                            We use this to coordinate meets (departures, etc.)
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <br />
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Address Line 1</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Address Line 2</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Post Code / Zip</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col><Col md={5}>
                                                    <Form.Group>
                                                        <Form.Label>City</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col><Col md={5}>
                                                    <Form.Group>
                                                        <Form.Label>Country</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                        <Form.Text muted>
                                                            Your address is required for insurance purposes
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <br />
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Additional Emergency Contact Name</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                    </Form.Group>
                                                </Col><Col>
                                                    <Form.Group>
                                                        <Form.Label>Additional Emergency Contact Number</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                        <Form.Text muted>
                                                            Optionally specify an additional emergency contact
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <br />
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>BMC Membership Number</Form.Label>
                                                        <Form.Control type="text" placeholder={this.props.user} />
                                                        <Form.Text muted>
                                                            Leave blank if unknown
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card.Text>
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