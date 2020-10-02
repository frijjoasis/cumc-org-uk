import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import defaults from "./defaults";
import Alert from "react-bootstrap/Alert";

class EditQuestions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            questions: this.props.content.questions.length ? this.props.content.questions : [],
            validated: false
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.content !== prevProps.content) {
            this.setState({
                content: this.props.content,
                questions: (!this.props.content.questions || !this.props.content.questions.length)
                    ? [] : this.props.content.questions
            })
            // React only calls the constructor once, and not on re-render.
        }
    }

    addDefaults(event) {
        const preset = event.currentTarget.elements.preset.value.toLowerCase();
        this.setState(state => {
            return {
                questions: defaults[preset].concat(state.questions)
            };
        });
        event.preventDefault();
        event.stopPropagation();
    }

    addQuestion(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false || this.state.questions.filter(q => q.id === form.elements.id.value).length) {
            this.setState({validated: true})
        } else {
            const elements = event.currentTarget.elements;
            const question = [...elements].reduce((acc, cur) => {
                acc[cur.id] = cur.value;
                return acc;
            }, {})
            delete question[""]; // Artifact of how [...elements] is constructed.
            question.required = elements.required.checked;
            this.setState(state => {
                return {
                    questions: [question, ...state.questions]
                }
            });
            ReactDOM.findDOMNode(this.questionForm).reset();
        }
        event.preventDefault();
        event.stopPropagation();
    }

    deleteQuestion(event) {
        const id = event.currentTarget.id;
        this.setState(state => {
            return {
                questions: state.questions.filter(q => q.id !== id)
            }
        });
        event.preventDefault();
        event.stopPropagation();
    }

    submitQuestions() {
        const id = this.props.pathname.includes("edit") ? this.props.id : this.props.newID;
        if (id) {
            axios.post('/api/meets/questions', {
                questions: this.state.questions,
                id: id
            }).then(res => {
                if (res.data.err) {
                    this.setState({err: res.data.err});
                    window.scrollTo(0, 0);
                } else {
                    window.scrollTo(0, 0);
                    this.setState({
                        success: "Set questions successfully.",
                        err: undefined
                    });
                }
            });
        } else {
            this.setState({err: "Could not find meet! If you are creating a new one, you should update the details first."});
        }
    }

    render() {
        return (
            <div>
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                {this.state.success ? <Alert variant="success">{this.state.success}</Alert> : null}
                <Form onSubmit={this.addDefaults.bind(this)}>
                    <Row>
                        <Col md={8}>
                            <Form.Group controlId="preset">
                                <Form.Label>Presets</Form.Label>
                                <Form.Control
                                    as="select"
                                >
                                    {["Indoor", "Outdoor", "Social", "Car"].map(i => {
                                        return <option selected={this.state.content.type === i}>{i}</option>
                                    })}
                                </Form.Control>
                                <Form.Text muted>
                                    Select an option and click the button to add default questions
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Button block style={{marginTop: "24px"}} type="submit">Add defaults</Button>
                        </Col>
                    </Row>
                </Form>
                <hr />
                <Form
                    onSubmit={this.addQuestion.bind(this)}
                    noValidate
                    validated={this.state.validated}
                    ref={form => this.questionForm = form}
                >
                    <Row>
                        <Col md={8}>
                            <Form.Group controlId="title">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Question title"
                                />
                                <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="id">
                                <Form.Label>ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Needs to be unique"
                                />
                                <Form.Control.Feedback type="invalid">Required, and needs to be unique</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <Form.Group controlId="help">
                                <Form.Label>Help Text</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Displays if input fails validation"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="text">
                                <Form.Label>Subtitle</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Displays underneath the question"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="required">
                                <Form.Label>Required?</Form.Label>
                                <Form.Check
                                    custom
                                    type="checkbox"
                                    id="required"
                                    label="Question is required"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Button block type="submit" style={{marginTop: "24px"}}>Add question</Button>
                        </Col>
                    </Row>
                </Form>
                <hr />
                <Card.Title>Preview</Card.Title>
                <Card.Subtitle>Click the <i className="fa fa-times" /> to remove a question</Card.Subtitle>
                <hr />
                <Form className="was-validated">
                    {this.state.questions.map(q => {
                        return (
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>{q.title}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={`ID: ${q.id}`}
                                            required={q.required}
                                        />
                                        <Form.Text muted>{q.text}</Form.Text>
                                        <a id={q.id} href="#!" onClick={this.deleteQuestion.bind(this)}>
                                            <i className="fa fa-times float-right" />
                                        </a>
                                        <Form.Control.Feedback type="invalid">{q.help}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )
                    })}
                    <br /><br />
                    <Row>
                        <Col>
                            <Button block variant="success" onClick={this.submitQuestions.bind(this)}>Save Form</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

export default EditQuestions;