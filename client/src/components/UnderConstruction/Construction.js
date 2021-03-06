import React from 'react';
import Button from "react-bootstrap/Button";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import {withRouter} from "react-router-dom";

import img from '../../assets/img/404.jpg';

class Construction extends React.Component {
    render() {
        return (
            <div className="content">
                <Container>
                    <Row className="justify-content-center">
                        <Col style={{flex: 0}}>
                            <Card>
                                <Image rounded src={img} />
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p className="text-center">This page is currently under construction. Come back soon!</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button className="float-right" onClick={this.props.history.goBack}>
                                Go Back</Button>
                        </Col>
                        <Col>
                            <Button className="float-left" href="/home">Go Home</Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(Construction);