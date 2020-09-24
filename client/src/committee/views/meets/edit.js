import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
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
                            <Tabs defaultActiveKey="details">
                                <Tab title="Details" eventKey="details">
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Details</Card.Title>
                                            <Card.Subtitle>Edit '{this.state.content.title}' meet details</Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                </Tab>
                                <Tab title="Questions" eventKey="questions">
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Questions</Card.Title>
                                            <Card.Subtitle>Here you can edit the form design for </Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default EditMeet;