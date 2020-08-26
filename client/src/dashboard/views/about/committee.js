import React from 'react';
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import UserCard from '../../../components/UserCard/UserCard';
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";

// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// (Yes, that's webpack not node, but node is even more restrictive)
// I kNoW i'LL uSE jAVaScRipT FoR tHIS pRojEcT!!!!!1!1one!
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "President",
        name: "Sam Reynolds",
        social: "president@cumc.org.uk",
        profile: require(`../../../assets/img/committee/president.jpg`),
        cover: require(`../../../assets/img/committee/presidentCover.jpg`),
    },
    treasurer: {
        role: "Treasurer",
        name: "Edmund Ross",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../assets/img/committee/treasurer.jpg`),
        cover: require(`../../../assets/img/committee/treasurerCover.jpg`),
    },
    secretary: {
        role: "Secretary",
        name: "Ilya Carey",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../assets/img/committee/secretary.jpg`),
        cover: require(`../../../assets/img/committee/secretaryCover.jpg`),
    },
};

class CommitteeAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                head: [],
                body: [],
            }
        }
    }

    componentDidMount() {
        axios.get("/api/committee/past").then(res => {
            this.setState({
                content: res.data,
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row className="justify-content-md-center">
                        <Col sm={3}>
                            <UserCard person={committee.treasurer} />
                        </Col>
                        <Col sm={3}>
                            <UserCard person={committee.president} />
                        </Col>
                        <Col sm={3}>
                            <UserCard person={committee.secretary} />
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col>
                            <UserCard person={committee.treasurer} />
                        </Col>
                        <Col>
                            <UserCard person={committee.treasurer} />
                        </Col>
                        <Col>
                            <UserCard person={committee.treasurer} />
                        </Col>
                        <Col>
                            <UserCard person={committee.treasurer} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card ctTableFullWidth ctTableResponsive>
                                <Card.Body>
                                    <Card.Title>Past Committees</Card.Title>
                                    <Card.Subtitle>
                                        Here you can find the committees of years past.
                                    </Card.Subtitle>
                                    <Table striped hover>
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

export default CommitteeAbout;