import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

import PayPalButtons from "../../../components/PayPalButton/PayPalButtons";

class BritRock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            err: false,
            name: "",
            email: "",
            ticket: "",
            success: false
        }
    }

    handleChange(event) {
        this.setState({
            [event.target.id]: event.target.value
        })
    }

    generateTicketID() {
        this.setState({
            ticket: `${Math.floor(Math.random() * 999) + 100}-${Math.floor(Math.random() * 999) + 100}`
        }) // Could I be bothered to install a UUID package? No! This should have a tiny prob. of collisions.
    }

    renderSuccess() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        Success!
                    </Card.Title>
                    <Card.Subtitle>
                        Your payment has been received.
                    </Card.Subtitle>
                    <Card.Text>
                        <hr />
                        <h1 style={{textAlign: "center"}}>Your ticket ID is #{this.state.ticket}.</h1>
                        <br/>
                        <p>
                            Please make a note of this number. It will be included with your payment confirmation email
                            from PayPal. Email us if you lose it, or you would like to cancel - but be aware that we
                            cannot offer refunds after the 15th Nov.
                        </p>
                    </Card.Text>
                </Card.Body>
            </Card>
        ) // latest refund date is usually a week before the date of the event
    }

    render() {
        if (!this.state.ticket) this.generateTicketID();
        return (
            <div className="content">
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            {this.state.success ? this.renderSuccess() :
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Tickets for Brit Rock Film Tour 2024 at CUMC</Card.Title>
                                        <Card.Subtitle>
                                            The Brit Rock Film Tour 2024 program presents a stunning line-up of the UK’s best climbing and adventure films. Three superb films capturing all the action, wild characters and stunning locations in what are truly inspiring stories. <br/>
                                            This will be hosted in the Main Lecture Theatre, Divinity School, St John's College, Cambridge, on the 14 Nov 2024 at 7pm. <br/>
                                            For more information, see the <a href="/meets/upcoming/view/279">meets page</a>. <br/>
                                            Please Note: This sign up is for Non-Members of CUMC only. If you are a member, please sign in, and sign up <a href="/meets/upcoming/view/279">here</a>.
                                        </Card.Subtitle>
                                        <Card.Text>
                                        <hr/>
                                        <Form>
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control type="email"
                                                                      id="email"
                                                                      placeholder={"Please enter your email"}
                                                                      onChange={this.handleChange.bind(this)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Full Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            id="name"
                                                            placeholder={"Please enter your name"}
                                                            onChange={this.handleChange.bind(this)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <br/><br/>
                                            <Row>
                                                <Col>
                                                    <div>
                                                        <Form.Label>Pay for Ticket (£12.00)</Form.Label>
                                                        <div className="text-center">
                                                            <PayPalButtons
                                                                price={"12.00"}
                                                                description={`Brit Rock Ticket - ID ${this.state.ticket}`}
                                                                intent='britrock'
                                                                form={{
                                                                    name: this.state.name,
                                                                    email: this.state.email,
                                                                    ticket: this.state.ticket
                                                                }}
                                                                onSuccess={() => this.setState({
                                                                    success: true
                                                                })
                                                                }
                                                                onError={(err) => this.setState({
                                                                    err: err
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Form>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            }
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default BritRock;
