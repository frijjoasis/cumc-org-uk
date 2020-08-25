import React from 'react';
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import UserCard from '../../../components/UserCard/UserCard';

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
                </Container>
            </div>
        )
    }
}

export default CommitteeAbout;