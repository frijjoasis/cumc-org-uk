import React from 'react';
import axios from 'axios';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";

import img1 from "../../../../assets/img/theClub-1.jpg";
import img2 from "../../../../assets/img/theClub-2.jpg";

import {clubAbout, historyAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

class ClubAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                head: [],
                body: [],
            },
        }
    }

    componentDidMount() {
        axios.get("/api/about/routes").then(res => {
            this.setState({
                content: res.data,
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <AboutCard title="About CUMC" text={clubAbout} />
					<Row className="justify-content-center">
						<Col md={6}>
							<Card>
								<Image fluid src={img1} />
                                <Card.Footer className="text-center text-muted">
                                    The 2022 CIC Hut winter climbing trip
                                </Card.Footer>
							</Card>
						</Col>
						<Col md={6}>
							<Card>
								<Image fluid src={img2} />
                                <Card.Footer className="text-center text-muted">
                                    One of the 2023 outdoor meets secretaries, Joe
                                </Card.Footer>
							</Card>
						</Col>
					</Row>
                    <AboutCard title="Club History" text={historyAbout} />
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>New Routes</Card.Title>
                                    <Card.Subtitle>
                                        This is a list of some of the routes first climbed by CUMC members.
                                    </Card.Subtitle>
                                    <hr />
                                    <Table bordered hover responsive>
                                        <thead>
                                        <tr>
                                            {this.state.content.head.map((prop, key) => {
                                                return <th key={key}>{prop}</th>;
                                            })}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.content.body.map((prop, key) => {
                                            return (
                                                <tr key={key}>
                                                    {prop.map((prop, key) => {
                                                        return <td key={key}>{prop}</td>;
                                                    })}
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default ClubAbout;
