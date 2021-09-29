import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Alert from "react-bootstrap/Alert";
import EditQuestions from "../../../components/EditMeet/EditQuestions";
import EditDetails from "../../../components/EditMeet/EditDetails";

class EditMeet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                questions: []
            },
        }
    }

    setNewID(id) {
        this.setState({
            newID: id
        });
    }

    componentDidMount() {
        if (this.props.match.params.id) {
            axios.post('/api/meets/signups', {id: this.props.match.params.id}).then(res => {
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
                                                <EditDetails
                                                    content={this.state.content}
                                                    id={this.props.match.params.id}
                                                    pathname={this.props.location.pathname}
                                                    onSubmit={id => this.setNewID(id)}
                                                />
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="questions">
                                                <Card.Title>Questions</Card.Title>
                                                <Card.Subtitle>Edit signup form design</Card.Subtitle>
                                                <hr />
                                                <EditQuestions
                                                    content={this.state.content}
                                                    id={this.props.match.params.id}
                                                    pathname={this.props.location.pathname}
                                                    newID={this.state.newID}
                                                />
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