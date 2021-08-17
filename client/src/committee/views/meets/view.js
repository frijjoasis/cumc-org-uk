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

    capturePayments() {
        axios.post('/api/paypal/capture', {id: this.props.match.params.id}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
            } else {
                this.setState({
                    success: "Payments captured successfully. Please refresh the page"
                })
            }
        });
    }

    capturePayment(mem) {
        axios.post('/api/paypal/capture', {id: this.props.match.params.id, authID: mem.authID}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
            } else {
                this.setState({
                    success: `Payment for ${mem.displayName} captured successfully, if it hadn't been already. Please refresh.`
                })
            }
        });
    }

    voidPayment(mem) {
        axios.post('/api/paypal/void', {id: this.props.match.params.id, authID: mem.authID}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
            } else {
                this.setState({
                    success: `Payment for ${mem.displayName} voided successfully, if it hadn't been captured. Please refresh.`
                })
            }
        });
    }

    voidPayments() {
        axios.post('/api/paypal/void', {id: this.props.match.params.id}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
            } else {
                this.setState({
                    success: "Payments voided successfully. Please refresh the page"
                })
            }
        });
    }

    sortQuestions(q, w) {
        if (q.id === w.id) return 0;
        return q.id > w.id ? 1 : -1;
    } // Quick sort by ID function, so that questions (and answers) will be listed consistently

    emailString() {
        let str = "mailto:";
        if (this.state.content.signups && this.state.content.signups.length) {
            str = str + this.state.content.signups.map(signup => {
                console.log(signup)
                return signup.user.email
            }).toString();
        }
        return str;
    }

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                {this.state.success ? <Alert variant="success">{this.state.success}</Alert> : null}
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
                                                    "Name", "Admin", "Created At", "Payment Status"
                                                ].concat((this.state.content.questions ? this.state.content.questions : [])
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
                                                                <div>
                                                                    <span style={{color: '#1DC7EA', cursor: 'pointer'}}
                                                                       onClick={() => this.voidPayment(mem)}>
                                                                        Reject
                                                                    </span>
                                                                    <br />
                                                                    <span style={{color: '#1DC7EA', cursor: 'pointer'}}
                                                                       onClick={() => this.capturePayment(mem)}>
                                                                         Capture
                                                                    </span>
                                                                </div>,
                                                                new Date(mem.createdAt).toUTCString(),
                                                                mem.authID ? <div className="text-success">
                                                                        {mem.captureID ? mem.captureID : 'Not Captured'}
                                                                </div> :
                                                                    <div className="text-danger">Not Valid</div>
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
                                        {(this.state.content.questions && this.state.content.questions.length)
                                            ? this.state.content.questions.map((q, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                q.title,
                                                                q.required ? <div className="text-success">Yes</div>
                                                                    : <div className="text-danger">No</div>,
                                                                q.text,
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
                            <Button block href={this.emailString()}>Email Signups</Button>
                        </Col>
                        <Col>
                            <NavLink className="btn btn-block btn-danger" to={`/committee/meets/edit/${this.props.match.params.id}`}>
                                Edit Meet</NavLink>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            <Button block variant="success" onClick={this.capturePayments.bind(this)}>
                                Capture Payments
                            </Button>
                        </Col>
                        <Col>
                            <Button block variant="danger" onClick={this.voidPayments.bind(this)}>
                                Void Payments
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default ViewMeet;