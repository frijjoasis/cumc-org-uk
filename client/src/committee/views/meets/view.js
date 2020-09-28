import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";

class ViewMeet extends React.Component {
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

    sortQuestions(q, w) {
        if (q.id === w.id) return 0;
        return q.id > w.id ? 1 : -1;
    } // Quick sort by ID function, so that questions (and answers) will be listed consistently

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Meet Administration</Card.Title>
                                    <Card.Subtitle>{this.state.content.title}</Card.Subtitle>
                                    <Card.Text as="span">
                                        <hr />

                                        <div className="text-muted" style={{display: 'inline'}}>Dates: </div>
                                        {new Date(this.state.content.startDate).toUTCString() + " "}-
                                        {" " + new Date(this.state.content.endDate).toUTCString()}
                                        <br />

                                        <div className="text-muted" style={{display: 'inline'}}>Organiser: </div>
                                        {this.state.content.user.firstName} {this.state.content.user.lastName}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Signups</Card.Title>
                                    <Card.Subtitle>
                                        Members currently signed up to {this.state.content.title}
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            {
                                                [
                                                    "Name", "Created At"
                                                ].concat(this.state.content.questions
                                                    .sort(this.sortQuestions)
                                                    .map(q => q.title)
                                                ).map((e, key) => {
                                                    return <th key={key}>{e}</th>
                                                })
                                            }
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.signups && this.state.content.signups.length
                                            ? this.state.content.signups.map((mem, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                <NavLink to={`/committee/members/${mem.userID}`}>
                                                                    {mem.displayName}
                                                                </NavLink>,
                                                                new Date(mem.createdAt).toUTCString()
                                                            ].concat(mem.answers
                                                                .sort(this.sortQuestions)
                                                                .map(a => a.value)
                                                            ).map((e, key) => {
                                                                return <td key={key}>{e}</td>;
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            }) : <tr><td className="text-center" colSpan={2}>None yet!</td></tr>}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Questions</Card.Title>
                                    <Card.Subtitle>Form structure for {this.state.content.title}</Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            {
                                                [
                                                    "Question", "Required?", "Description", "Help Text"
                                                ].map((e, key) => {
                                                    return <th key={key}>{e}</th>
                                                })
                                            }
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.questions.length
                                            ? this.state.content.questions.map((q, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                q.title,
                                                                q.required ? <div className="text-success">Yes</div>
                                                                    : <div className="text-danger">No</div>,
                                                                q.desc,
                                                                q.help
                                                            ].map((e, key) => {
                                                                return <td key={key}>{e}</td>;
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            }) : <tr><td className="text-center" colSpan={4}>Nothing here :(</td></tr>}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <NavLink className="btn btn-block btn-success"
                                     to={`/committee/meets/reimburse/${this.props.match.params.id}`}>
                                Reimburse Drivers</NavLink>
                        </Col>
                        <Col>
                            <Button block href="/">Email Signups</Button>
                        </Col>
                        <Col>
                            <NavLink className="btn btn-block btn-danger" to={`/committee/meets/edit/${this.props.match.params.id}`}>
                                Edit Meet</NavLink>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default ViewMeet;