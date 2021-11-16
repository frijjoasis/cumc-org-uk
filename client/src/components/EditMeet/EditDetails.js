import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Alert from "react-bootstrap/Alert";

class EditDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            validated: false
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.content !== prevProps.content) {
            this.setState({
                content: this.props.content
            }); // React only calls the constructor once, and not on re-render.
        }
    }

    deleteMeet() {
        if (this.props.id && this.props.pathname.includes("edit")) {
            axios.post('/api/meets/delete', {id: this.props.id}).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0, 0);
                } else {
                    window.location.href = `/committee/meets/`;
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

            answers.startDate = new Date(
                `${form.elements.startDate.value} ${form.elements.startTime.value}`.replace("/", "-")
                // Browser compatibility
            );
            answers.endDate = new Date(
                `${form.elements.endDate.value} ${form.elements.endTime.value}`.replace("/", "-")
            );
            // Reconstruct date objects
            answers.disabled = form.elements.disabled.checked;
            answers.hidden = form.elements.hidden.checked;

            answers.id = this.props.pathname.includes("edit") ? this.props.id : null
            // Only include a meetID if we want to edit a meet. Otherwise we assume clone/new

            axios.post('/api/meets/edit', answers).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0,0);
                } else {
                    this.props.onSubmit(res.data); // Pass generated ID to parent component
                    this.setState({
                        success: "Meet details set successfully. If this is a new meet, you should set some questions."
                    });
                    window.scrollTo(0, 0);
                }
            });
        }
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        return (
            <Form noValidate
                  validated={this.state.validated}
                  onSubmit={this.handleSubmit.bind(this)}
            >
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                {this.state.success ? <Alert variant="success">{this.state.success}</Alert> : null}
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
                                required
                            >
                                {["Indoor", "Outdoor", "Social", "Other"].map(i => {
                                    return <option selected={this.state.content.type === i}>{i}</option>
                                })}
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
                                onClick={() => this.setState(prevState => ({
                                    content: {
                                        ...prevState.content,
                                        disabled: !prevState.content.disabled
                                    }
                                }))}
                                checked={this.state.content.disabled}
                                label="Disable signups?"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="hidden">
                            <Form.Check
                                custom
                                type="checkbox"
                                id="hidden"
                                onClick={() => this.setState(prevState => ({
                                    content: {
                                        ...prevState.content,
                                        hidden: !prevState.content.hidden
                                    }
                                }))}
                                checked={this.state.content.hidden}
                                label="Hide meet from the upcoming menu?"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <br /><br />
                <Row>
                    <Col md={8}>
                        <Button block type="submit">Submit</Button>
                    </Col>
                    <Col md={4}>
                        <Button
                            block
                            variant="danger"
                            onClick={this.deleteMeet.bind(this)}>
                            Delete
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

export default EditDetails;