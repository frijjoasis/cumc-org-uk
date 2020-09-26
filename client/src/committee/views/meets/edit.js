import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";

class EditMeet extends React.Component {
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
                                                <Card.Text as="span">
                                                    <hr />
                                                </Card.Text>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="questions">
                                                <Card.Title>Questions</Card.Title>
                                                <Card.Subtitle>Edit signup form design</Card.Subtitle>
                                                <Card.Text as="span">
                                                    <hr />
                                                </Card.Text>
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