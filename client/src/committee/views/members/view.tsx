import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { withRouter, RouterProps } from '../../../utils/withRouter';
import { User, Member, Meet } from '@/types/models';

interface MeetHistoryItem {
  meet: Meet;
  createdAt?: string;
}

interface DisplayField {
  name: string;
  display: (content: User) => React.ReactNode;
}

interface ViewMemberProps extends RouterProps {}

interface ViewMemberState {
  content: User;
  history: MeetHistoryItem[];
  err?: string;
}

class ViewMember extends React.Component<ViewMemberProps, ViewMemberState> {
  constructor(props: ViewMemberProps) {
    super(props);
    this.state = {
      content: {} as User,
      history: [],
    };
  }

  componentDidMount() {
    // Access route params via router.params instead of match.params
    const { id } = this.props.router.params;

    if (id) {
      axios.post('/api/user/member', { id }).then(res => {
        if (res.data.err) {
          this.setState({ err: res.data.err });
          window.scrollTo(0, 0);
        } else
          this.setState({
            content: res.data,
          });
      });
      axios.post('/api/meets/historyOther', { id }).then(res => {
        this.setState({
          history: res.data,
        });
      });
    }
  }

  render() {
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
                  <Card.Title>Member Details</Card.Title>
                  <Card.Subtitle>
                    If you need to edit these details, please contact the
                    webmaster with an explanation as to why.
                  </Card.Subtitle>
                  <Card.Text as="span">
                    <hr />
                    {[
                      {
                        name: 'Full Name',
                        display: c =>
                          c.firstName
                            ? `${c.firstName} ${c.lastName}`
                            : c.displayName,
                      },
                      { name: 'College', display: c => c.college },
                      { name: 'Email', display: c => c.email },
                      {
                        name: 'Address',
                        display: c => [
                          <br />,
                          c.address1,
                          <br />,
                          c.address2,
                          <br />,
                          (c.postCode ? c.postCode : '') +
                            ', ' +
                            (c.city ? c.city : '') +
                            ' ' +
                            (c.country ? c.country : ''),
                        ],
                      },
                      { name: 'Date of Birth', display: c => c.dob },
                      { name: 'Phone', display: c => c.phone },
                      {
                        name: 'Emergency Contact',
                        display: c =>
                          (c.emergencyName ? c.emergencyName : '') +
                          ', ' +
                          (c.emergencyPhone ? c.emergencyPhone : ''),
                      },
                      { name: 'BMC Number', display: c => c.bmc },
                      {
                        name: 'Current Member',
                        display: c =>
                          c.member && c.member.hasPaid ? (
                            <div
                              className="text-success"
                              style={{ display: 'inline' }}
                            >
                              Yes
                            </div>
                          ) : (
                            <div
                              className="text-danger"
                              style={{ display: 'inline' }}
                            >
                              No
                            </div>
                          ),
                      },
                    ].map((i, key) => {
                      return (
                        <div key={key}>
                          <div
                            className="text-muted"
                            style={{ display: 'inline' }}
                          >
                            {i.name}:{' '}
                          </div>
                          {i.display(this.state.content)}
                          <br />
                        </div>
                      );
                    })}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Meet History</Card.Title>
                  <Card.Subtitle>
                    All the meets this member has signed up to:
                  </Card.Subtitle>
                  <hr />
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        {['Meet', 'Type', 'Price', 'Date'].map((e, key) => {
                          return <th key={key}>{e}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.history.length ? (
                        this.state.history.map((s, key) => {
                          return (
                            <tr key={key}>
                              {[
                                s.meet.title,
                                s.meet.type,
                                `£${s.meet.price || 0}`,
                                new Date(s.meet.startDate).toUTCString(),
                              ].map((e, key) => {
                                return <td key={key}>{e}</td>;
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center">
                            Nothing here :(
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default withRouter(ViewMember);
