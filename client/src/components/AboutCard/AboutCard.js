import React from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";

export class AboutCard extends React.Component {
    render() {
        return (
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <h2>{this.props.title}</h2>
                            <span>
                                <hr />
                                <p>{this.props.text}</p>
                            </span>
                        </Card.Body>
                        {this.props.button ?
                            <Card.Footer>
                                {(this.props.button.type === "button") ?
                                    <Button className="float-right" href={this.props.button.to}>
                                        {this.props.button.text}
                                    </Button> :
                                    <NavLink className="float-right btn btn-primary" to={this.props.button.to}>
                                        {this.props.button.text}
                                    </NavLink>
                                }
                            </Card.Footer> : null
                        }
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default AboutCard;