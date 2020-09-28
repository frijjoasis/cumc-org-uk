import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

class EditQuestions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            questions: {}
        }
    }


    render() {
        return (
            <div>
                <Row>
                    <Col md={6}>
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
                                Select an option and click the button to add default questions
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="disabled">
                            <Form.Label>Requires Car?</Form.Label>
                            <Form.Check
                                custom
                                type="checkbox"
                                id="requires-car"
                                checked={this.state.disabled}
                                label="Add car questions"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Button block style={{marginTop: "24px"}}>Add defaults</Button>
                    </Col>
                </Row>
                <hr />
            </div>
        )
    }
}

export default EditQuestions;