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
                            cannot offer refunds after the 30th Jan.
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
                                        <Card.Title>Screening: Nikolai Schirmer - The Greatest Ski Tour of All Time - at CUMC [EARLY BIRD SALE - ENDS 22 JAN]</Card.Title>
                                        <Card.Subtitle>
                                        The hyper commercial world of professional freeride skiing collides with the purist misanthropic ways of the mountaineer, when skier and filmmaker Nikolai Schirmer discovers that his reclusive childhood friend is embarking on a ski tour like nothing done before, and that he’s not planning to tell a soul.
                                        <br/><br/>
                                        Vegard Rye is training to climb and ski 27 mountains in a single push. The equivalent of running four marathons while climbing Mount Everest from sea level - three times. To be able to achieve this inhuman feat Vegard is isolating himself from friends and family, living in caves and dedicating his entire existence to better himself.
                                        <br/><br/>
                                        Nikolai sets out to share his friend’s story with the world, telling his sponsors it'll be The Greatest Ski Tour of All Time, and attempts to appropriate his friend’s snow warrior monk ways of training to lift his own skiing to new heights.
                                        <br/><br/>
                                        Nikolai quickly learns it’s easier to sell a story than to live through it though. All the while the bigger question of why he lost his best friend and mountain partner so many years ago lingers.
                                        <br/><br/>
                                        Date: Thu, 06 Feb 2025 19:15-22:00<br/>
                                        Location: Main Lecture Theatre, Divinity School, St John's College
                                        <br/><br/>
                                        Please Note: This sign up is for Non-Members of CUMC only. If you are a member, please sign in, and sign up <a href="/meets/upcoming/view/299">here</a>.
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
                                                        <Form.Label>Pay for Ticket (£8.00)</Form.Label>
                                                        <div className="text-center">
                                                            <PayPalButtons
                                                                price={"8.00"}
                                                                description={`"Nikolai Schirmer - The Greatest Ski Tour of All Time" Ticket - ID ${this.state.ticket}`}
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
