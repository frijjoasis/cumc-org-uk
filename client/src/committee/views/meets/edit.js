import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";

class EditMeet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                user: {},
                questions: []
            },
            validated: false
        }
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            axios.post('/api/meets/view', {id: this.props.match.params.id}).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0, 0);
                } else {
                    const startDate = new Date(res.data.startDate);
                    const endDate = new Date(res.data.endDate);
                    res.data.startTime = startDate.toLocaleTimeString();
                    res.data.endTime = endDate.toLocaleTimeString();
                    res.data.startDate = startDate.toISOString().substr(0, 10);
                    res.data.endDate = endDate.toISOString().substr(0, 10); // Will break past year 9999
                    // Unfortunately, type=datatime-local is not supported by Firefox. So we deconstruct the date accordingly...
                    this.setState({
                        content: res.data
                    });
                }
            });
        }
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({validated: true})
        } else {
            const answers = [...form.elements].reduce((acc, cur) => {
                acc[cur.id] = cur.value;
                return acc;
            }, {});

            answers.startDate = new Date(`${form.elements.startDate.value} ${form.elements.startTime.value}`);
            answers.endDate = new Date(`${form.elements.endDate.value} ${form.elements.endTime.value}`);
            // Reconstruct date objects
            answers.disabled = form.elements.disabled.checked;

            answers.id = this.props.location.pathname.includes("edit") ? this.props.match.params.id : null
            // Only include a meetID if we want to edit a meet. Otherwise we assume clone/new

            axios.post('/api/meets/edit', answers).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0,0);
                } else {
                    window.location.href = `/committee/meets/`;
                }
            });
        }
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Tab.Container id="tabs-edit-meet" defaultActiveKey="details">
                                    <Card.Header>
                                        <Nav variant="tabs" defaultActiveKey="details" >
                                            <Nav.Item>
                                                <Nav.Link eventKey="details">Details</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="questions">Questions</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Card.Header>
                                    <Card.Body>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="details">
                                                <Card.Title>Details</Card.Title>
                                                <Card.Subtitle>Edit meet details</Card.Subtitle>
                                                <hr />
                                                <Form noValidate
                                                      validated={this.state.validated}
                                                      onSubmit={this.handleSubmit.bind(this)}
                                                >
                                                    <Row>
                                                        <Col>
                                                            <Form.Group controlId="title">
                                                                <Form.Label>Title</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="Required"
                                                                    defaultValue={this.state.content.title}
                                                                    required
                                                                />
                                                                <Form.Text muted>
                                                                    Title of the meet. Max 255 characters
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Form.Group controlId="subtitle">
                                                                <Form.Label>Subtitle</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="Required"
                                                                    defaultValue={this.state.content.subtitle}
                                                                    required
                                                                />
                                                                <Form.Text muted>
                                                                    Short description, meet tagline. Max 255 characters
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Form.Group controlId="desc">
                                                                <Form.Label>Description</Form.Label>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    placeholder="Required"
                                                                    defaultValue={this.state.content.desc}
                                                                    required
                                                                />
                                                                <Form.Text muted>
                                                                    Long meet description
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={4}>
                                                            <Form.Group controlId="startDate">
                                                                <Form.Label>Start Date</Form.Label>
                                                                <Form.Control
                                                                    type="date"
                                                                    defaultValue={this.state.content.startDate}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={2}>
                                                            <Form.Group controlId="startTime">
                                                                <Form.Label>Start Time</Form.Label>
                                                                <Form.Control
                                                                    type="time"
                                                                    defaultValue={this.state.content.startTime}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={4}>
                                                            <Form.Group controlId="endDate">
                                                                <Form.Label>End Date</Form.Label>
                                                                <Form.Control
                                                                    type="date"
                                                                    defaultValue={this.state.content.endDate}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={2}>
                                                            <Form.Group controlId="endTime">
                                                                <Form.Label>End Time</Form.Label>
                                                                <Form.Control
                                                                    type="time"
                                                                    defaultValue={this.state.content.endTime}
                                                                    required
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={8}>
                                                            <Form.Group controlId="type">
                                                                <Form.Label>Type</Form.Label>
                                                                <Form.Control
                                                                    as="select"
                                                                    defaultValue={this.state.content.type}
                                                                    required
                                                                >
                                                                    <option>Indoor</option>
                                                                    <option>Outdoor</option>
                                                                    <option>Social</option>
                                                                    <option>Other</option>
                                                                </Form.Control>
                                                                <Form.Text muted>
                                                                    What type of meet is this?
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={4}>
                                                            <Form.Group controlId="price">
                                                                <Form.Label>Price</Form.Label>
                                                                <InputGroup>
                                                                    <InputGroup.Prepend>
                                                                        <InputGroup.Text>£</InputGroup.Text>
                                                                    </InputGroup.Prepend>
                                                                    <Form.Control type="text"
                                                                                  placeholder="Required"
                                                                                  defaultValue={this.state.content.price}
                                                                                  required
                                                                    />
                                                                </InputGroup>
                                                                <Form.Text muted>
                                                                    Cost of the meet in GBP
                                                                </Form.Text>
                                                                <Form.Control.Feedback type="invalid">
                                                                    This field is required
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={4}>
                                                            <Form.Group controlId="disabled">
                                                                <Form.Check
                                                                    custom
                                                                    type="checkbox"
                                                                    id="disabled"
                                                                    checked={this.state.disabled}
                                                                    label="Disable signups?"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <br /><br />
                                                    <Row>
                                                        <Col><Button block type="submit">Submit</Button></Col>
                                                    </Row>
                                                </Form>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="questions">
                                                <Card.Title>Questions</Card.Title>
                                                <Card.Subtitle>Edit signup form design</Card.Subtitle>
                                                <hr />
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

export default EditMeet;