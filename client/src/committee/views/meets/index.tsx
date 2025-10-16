import React from 'react';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import { NavLink } from 'react-router-dom';
import { MeetContent } from '@/types/meet';

interface MeetManagerProps {
  location: {
    pathname: string;
    [key: string]: any;
  };
}

interface MeetManagerState {
  archive: boolean;
  content: MeetContent[];
}

class MeetManager extends React.Component<MeetManagerProps, MeetManagerState> {
  constructor(props) {
    super(props);
    this.state = {
      content: [],
      archive: this.props.location.pathname === '/committee/meets/archive',
    };
  }

  componentDidMount() {
    if (!this.state.archive) {
      axios.get('/api/meets/upcoming').then(res => {
        this.setState({
          content: res.data,
        });
      });
    } else {
      axios.get('/api/meets/all').then(res => {
        this.setState({
          content: res.data,
        });
      });
    }
  }

  sortMeets(m: MeetContent, n: MeetContent) {
    const mStart = new Date(m.startDate);
    const nStart = new Date(n.startDate);
    if (mStart === nStart) return 0;
    return mStart > nStart !== this.state.archive ? 1 : -1;
  }

  render() {
    return (
      <div className="content">
        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>
                  {this.state.archive ? 'Meets Archive' : 'Upcoming Meets'}
                </Card.Title>
                <Card.Subtitle>
                  Here you can clone, edit and view upcoming meets. To view
                  {this.state.archive
                    ? ' upcoming meets, click Upcoming. '
                    : ' past meets, click Meet Archive. '}
                  To create an entirely new meet, click New. Admin such as
                  paying drivers is done through the view window.
                </Card.Subtitle>
                <hr />
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      {[
                        'Name',
                        'Type',
                        'Signups',
                        'Start Date',
                        'End Date',
                        'Admin',
                      ].map((e, key) => {
                        return <th key={key}>{e}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.content.length ? (
                      this.state.content
                        .sort(this.sortMeets.bind(this))
                        .map((meet, key) => {
                          return (
                            <tr key={key}>
                              {[
                                meet.title,
                                meet.type,
                                meet.disabled ? (
                                  <div className="text-danger">Disabled</div>
                                ) : (
                                  <div className="text-success">Open</div>
                                ),
                                new Date(meet.startDate).toUTCString(),
                                new Date(meet.endDate).toUTCString(),
                                <div>
                                  <NavLink
                                    to={`/committee/meets/view/${meet.id}`}
                                  >
                                    View
                                  </NavLink>
                                  <NavLink
                                    to={`/committee/meets/edit/${meet.id}`}
                                  >
                                    Edit
                                  </NavLink>
                                  <NavLink
                                    to={`/committee/meets/clone/${meet.id}`}
                                  >
                                    Clone
                                  </NavLink>
                                </div>,
                              ].map((e, key) => {
                                return <td key={key}>{e}</td>;
                              })}
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td className="text-center" colSpan={6}>
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
        <Row>
          <Col>
            <NavLink
              className="btn btn-block btn-success"
              to="/committee/meets/new"
            >
              New
            </NavLink>
          </Col>
          <Col>
            <NavLink
              className="btn btn-block"
              to={`/committee/meets/${this.state.archive ? '' : 'archive'}`}
            >
              {this.state.archive ? 'Upcoming' : 'Archive'}
            </NavLink>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MeetManager;
