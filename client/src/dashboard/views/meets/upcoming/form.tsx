import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import { Navigate, useParams } from 'react-router-dom';
import PayPalButtons from '../../../../components/PayPalButton/PayPalButtons';
import { Meet, User } from '@/types/models';

interface MeetFormClassProps {
  id: string | number;
  user: User;
}
interface MeetFormClassState {
  validated: boolean;
  showPayment: boolean;
  err: false | string;
  meet: any;
  data?: {
    answers: any[];
    meetID: string | number;
  };
}

class MeetFormClass extends React.Component<
  MeetFormClassProps,
  MeetFormClassState
> {
  constructor(props: MeetFormClassProps) {
    super(props);
    this.state = {
      validated: false,
      showPayment: false,
      err: false,
      meet: {},
    };
  }

  componentDidMount() {
    axios.post('/api/meets/view', { id: this.props.id }).then(res => {
      if (res.data.err) {
        this.setState({ err: res.data.err });
        window.scrollTo(0, 0);
      } else {
        this.setState({
          meet: res.data,
        });
      }
    });
  }

  handleSubmit(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      this.setState({ validated: true });
    } else {
      const answers = [...form.elements].reduce((acc, cur) => {
        if (cur.id && !['privacy', 'participation', 'data'].includes(cur.id)) {
          acc.push({ id: cur.id, value: cur.value });
        }
        return acc;
        // Avoid POSTing email, display name and checkboxes
      }, []);
      const data = {
        answers: answers,
        meetID: this.props.id,
      };
      axios.post('/api/paypal/required', data).then(res => {
        if (res.data.err) {
          this.setState({ err: res.data.err });
          window.scrollTo(0, 0);
        } else if (res.data) {
          // Payment required
          this.setState({
            showPayment: true,
            data: data,
          });
        } else {
          window.location.href = `/meets/upcoming/view/${this.props.id}`;
          // Payment wasn't required
        }
      });
    }
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    if (this.state.meet.disabled || !this.props.user) {
      return <Navigate to="/404" replace />;
    } else {
      return (
        <div className="content">
          {this.state.err ? (
            <Alert variant="danger">{this.state.err}</Alert>
          ) : null}
          <Container>
            <Row>
              <Col>
                <Card>
                  <Card.Body>
                    <Card.Title>
                      Register for {this.state.meet.title}
                    </Card.Title>
                    <Card.Subtitle>
                      Please fill out the form below
                    </Card.Subtitle>
                    <hr />
                    <Form
                      noValidate
                      validated={this.state.validated}
                      onSubmit={this.handleSubmit.bind(this)}
                    >
                      <Row>
                        <Col md={8}>
                          <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              readOnly
                              value={this.props.user.email}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control
                              type="text"
                              readOnly
                              value={this.props.user.displayName}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {this.state.meet.questions
                        ? this.state.meet.questions.map(question => {
                            return (
                              <Row>
                                <Col>
                                  <Form.Group controlId={question.id}>
                                    <Form.Label>{question.title}</Form.Label>
                                    <Form.Control
                                      type="text"
                                      required={question.required}
                                      placeholder={
                                        question.required
                                          ? 'Required'
                                          : 'Not Set'
                                      }
                                    />
                                    <Form.Text muted>{question.text}</Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                      {question.help}
                                    </Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                              </Row>
                            );
                          })
                        : null}
                      <Row>
                        <Col>
                          <Form.Group>
                            <Form.Check
                              type="checkbox"
                              id="data"
                              required
                              label="I have read, understand and agree to the club's data
                                                            safety policy, the club's protection statement and the BMC
                                                            participation statement"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <br />
                      <br />
                      <Row>
                        <Col>
                          {this.state.showPayment ? (
                            <div>
                              <Form.Label>Pay for Meet</Form.Label>
                              <div className="text-center">
                                <PayPalButtons
                                  price={this.state.meet.price}
                                  description={`Register for ${this.state.meet.title}`}
                                  intent="register"
                                  form={this.state.data}
                                  onSuccess={() =>
                                    (window.location.href = `/meets/upcoming/view/${this.props.id}`)
                                  }
                                  payer={{
                                    email_address: this.props.user.email,
                                  }}
                                  onError={err =>
                                    this.setState({
                                      err: err,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            <Button className="w-100" type="submit">
                              Submit
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      );
    }
  }
}

function MeetForm(props) {
  const { id } = useParams();
  return <MeetFormClass {...props} id={id} />;
}

export default MeetForm;
