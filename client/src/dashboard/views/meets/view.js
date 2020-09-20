import React from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Table from "react-bootstrap/Table";

class ViewMeet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                user: {}
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
                console.log(res.data);
            }
        });
    }

    render() {
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{this.state.content.title}</Card.Title>
                                    <Card.Subtitle>{this.state.content.subtitle}</Card.Subtitle>
                                    <Card.Text as="span">
                                        <hr />

                                        <div className="text-muted" style={{display: 'inline'}}>Dates: </div>
                                        {new Date(this.state.content.startDate).toUTCString() + " "}-
                                        {" " + new Date(this.state.content.endDate).toUTCString()}
                                        <br />

                                        <div className="text-muted" style={{display: 'inline'}}>Organiser: </div>
                                        {this.props.user ? `The emergency contact for this meet is 
                                        ${this.state.content.user.firstName} ${this.state.content.user.lastName} 
                                        on ${this.state.content.user.phone}`
                                            : [<NavLink to="/login">Sign in</NavLink>, " to view this information"]}
                                        <br />

                                        <div className="text-muted" style={{display: 'inline'}}>Price: </div>
                                        £{this.state.content.price}
                                        <br />

                                        <div className="text-muted">Description:</div>
                                        {this.state.content.desc}
                                        <br />

                                        {this.state.content.disabled ? <Button disabled variant="outline-dark"
                                            className="float-right">
                                                Coming Soon...
                                            </Button> :
                                            <NavLink className="float-right btn btn-primary"
                                                     to={`/meets/upcoming/register/${this.state.content.id}`}>
                                                Sign Up
                                            </NavLink>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {this.props.user ? <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Signups</Card.Title>
                                    <Card.Subtitle>
                                        Members currently signed up to this meet
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover responsive>
                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.signups && this.state.content.signups.length ? this.state.content.signups.map((mem, key) => {
                                            return (
                                                <tr key={key}>
                                                    <td className="text-center">{mem.displayName}</td>
                                                </tr>
                                            )
                                        }) : <tr><td className="text-center">None yet!</td></tr>}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row> : null}
                </Container>
            </div>
        )
    }
}

export default ViewMeet;