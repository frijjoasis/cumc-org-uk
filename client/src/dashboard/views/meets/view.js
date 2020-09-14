import React from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import {NavLink} from "react-router-dom";
import Alert from "react-bootstrap/Alert";

class ViewMeet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {},
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
                {this.state.err ? <Alert variant="danger">{this.state.err}</Alert> : null}
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{this.state.content.title}</Card.Title>
                                    <Card.Subtitle>{this.state.content.desc}</Card.Subtitle>
                                    <Card.Text as="span">
                                        <hr />
                                        <div className="text-muted" style={{display: 'inline'}}>Date: </div>
                                        {new Date(this.state.content.date).toUTCString()}<br />
                                        <div className="text-muted" style={{display: 'inline'}}>Signups: </div>
                                        {this.props.user ? this.state.content.members
                                            : [<NavLink to="/login">Sign in</NavLink>, " to view this information"]}<br />
                                        <div className="text-muted" style={{display: 'inline'}}>Organiser: </div>
                                        {this.props.user ? this.state.content.organiser
                                            : [<NavLink to="/login">Sign in</NavLink>, " to view this information"]}<br />
                                        <div className="text-muted" style={{display: 'inline'}}>Description: </div>
                                        {this.state.content.longDesc}
                                        <NavLink className="float-right btn btn-primary"
                                                 to={this.props.user ? "/login" : "/signup"}>
                                            Sign Up
                                        </NavLink>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default ViewMeet;