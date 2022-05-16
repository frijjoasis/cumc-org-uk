import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import {CSVLink} from "react-csv";
import {NavLink} from "react-router-dom";

class ViewMeet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                user: {},
                questions: []
            },
            signups: {
                questions: [],
                answers: []
            },
        }

        this.axiosPaypal = this.axiosPaypal.bind(this);
    }

    componentDidMount() {
        axios.post('/api/meets/signups', {id: this.props.match.params.id}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
                window.scrollTo(0,0);
            } else {
                res.data.questions = res.data.questions ? res.data.questions : []
                this.setState({
                    content: res.data,
                    signups: { // This is for CSV download. Rest of the page uses this.state.content
                        questions: res.data.questions.sort(this.sortQuestions).map(q => q.title),
                        answers: res.data.signups.map(mem => {
                            return [mem.displayName, mem.user.email, new Date(mem.createdAt).toUTCString(), mem.authID]
                                .concat(mem.answers
                                    .sort(this.sortQuestions)
                                    .map(a => a.value));
                        })
                    }
                });
            }
        });
    }

    axiosPaypal(url, mem, success) {
        let data = mem ? {id: this.props.match.params.id, authID: mem.authID} : {id: this.props.match.params.id}
        axios.post(`/api/paypal/${url}`, data).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
            } else {
                this.setState({
                    success: success
                })
                window.location.reload(true); //TODO: Should really code a state update here but I cba
            }
        });
    }

    sortQuestions(q, w) {
        if (q.id === w.id) return 0;
        return q.id > w.id ? 1 : -1;
    } // Quick sort by ID function, so that questions (and answers) will be listed consistently

    sortSignups(m, n) {
        const mStart = new Date(m.createdAt);
        const nStart = new Date(n.createdAt);
        if (mStart === nStart) return 0;
        return mStart > nStart ? -1 : 1;
    } // Sort listed signups by signup date

    emailString() {
        let str = "mailto:";
        if (this.state.content.signups && this.state.content.signups.length) {
            str = str + this.state.content.signups.map(signup => {
                return signup.user.email
            }).toString().replaceAll(',', '; ');
        }
        return str;
    }

    deleteSignup(id) {
        axios.post(`/api/meets/deleteSignup`, {id: id}).then(res => {
            if (res.data.err) {
                this.setState({err: res.data.err});
            } else {
                this.setState({
                    success: "Successfully deleted signup."
                })
                window.location.reload(true); //TODO: Should really code a state update here but I cba
            }
        });
    }

    captureStatusFormat(authID, captureID) {
        if (authID) {
            if (captureID) {
                if (captureID === "Capture Failed" || captureID === "Void Failed")
                    return <div className="text-danger">{captureID}</div>
                else if (captureID === "Void")
                    return <div className="text-info">{captureID}</div>
                else
                    return <div className="text-success">{captureID}</div>
            } else
                return <div className="text-warning">Not Captured</div>
        } else
            return <div className="text-danger">Not Valid</div>
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
                                                ].concat(this.state.signups.questions).map((e, key) => {
                                                    return <th key={key}>{e}</th>
                                                })
                                            }
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.signups && this.state.content.signups.length
                                            ? this.state.content.signups.sort(this.sortSignups).map((mem, key) => {
                                                return (
                                                    <tr key={key}>
                                                        {
                                                            [
                                                                <NavLink to={`/committee/members/${mem.userID}`}>
                                                                    {mem.displayName}
                                                                </NavLink>,
                                                                <div>
                                                                    <span style={{color: '#1DC7EA', cursor: 'pointer'}}
                                                                          onClick={() => this.axiosPaypal('void', mem,
                                                                       `Payment for ${mem.displayName} voided successfully, if it hadn't been captured.`
                                                                       )}>
                                                                        Reject
                                                                    </span>
                                                                    <br />
                                                                    <span style={{color: '#1DC7EA', cursor: 'pointer'}}
                                                                          onClick={() => this.axiosPaypal('capture', mem,
                                                                           `Payment for ${mem.displayName} captured successfully, if it hadn't been already.`
                                                                       )}>
                                                                        Capture
                                                                    </span>
                                                                    <br />
                                                                    <span style={{color: '#1DC7EA', cursor: 'pointer'}}
                                                                          onClick={() => this.deleteSignup(mem.id)}>
                                                                        Delete
                                                                    </span>
                                                                </div>,
                                                                new Date(mem.createdAt).toUTCString(),
                                                                this.captureStatusFormat(mem.authID, mem.captureID)
                                                            ].concat(mem.answers
                                                                .sort(this.sortQuestions)
                                                                .map(a => a.value)
                                                            ).map((e, key) => {
                                                                return <td key={key}>{e}</td>;
                                                            })
                                                        }
                                                    </tr>
                                                )
                                            }) : <tr><td className="text-center" colSpan={"100%"}>None yet!</td></tr>}
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
                            <CSVLink filename={`meet-${this.props.match.params.id}-export.csv`} data={
                                [
                                    ["Name", "Email", "Created At", "Authorisation ID"].concat(this.state.signups.questions),
                                ].concat(this.state.signups.answers)
                            }>
                                <Button block>
                                    Export Signups
                                </Button>
                            </CSVLink>
                        </Col>
                        <Col>
                            <NavLink className="btn btn-block btn-danger"
                                     to={`/committee/meets/edit/${this.props.match.params.id}`}>
                                Edit Meet</NavLink>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            <Button block variant="success"
                                    onClick={() => this.axiosPaypal('capture', false,
                                        "Payments captured successfully.")}>
                                Capture Payments
                            </Button>
                        </Col>
                        <Col>
                            <Button block variant="danger"
                                    onClick={() => this.axiosPaypal('void', false,
                                "Payments voided successfully.")}>
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