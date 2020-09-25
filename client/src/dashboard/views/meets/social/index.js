import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {NavLink} from "react-router-dom";
import Image from "react-bootstrap/Image";

import img from "../../../../assets/img/social-1.jpg";

import {socialMeets} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

class SocialMeets extends React.Component {
    render() {
        return (
            <div className="content">
                <Container>
                    <AboutCard title="Social Meets" text={socialMeets}
                        button={{to: "/meets/upcoming", text: "View Meets"}} />
                    <Row className="justify-content-center">
                        <Col style={{flex: 0}}>
                            <Card>
                                <Image src={img} />
                                <Card.Footer className="text-center text-muted">
                                    ~something social~
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default SocialMeets;