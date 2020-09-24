import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import {safetyAbout} from "./text";

class SafetyAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    {safetyAbout}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default SafetyAbout;