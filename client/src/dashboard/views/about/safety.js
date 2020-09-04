import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";

const safetyAbout = [
    
];

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
                                    <h2>Cambridge University Mountaineering Club Safety Policy</h2>
                                    <p>{safetyAbout}</p>
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