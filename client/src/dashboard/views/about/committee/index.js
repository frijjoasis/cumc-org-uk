import React from 'react';
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import UserCard from '../../../../components/UserCard/UserCard';

import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";

import {committee} from "./committee";

const oldCommittee = {
    'head' : ["Year","President","Secretary","Treasurer","Gear","Outdoor Meet","Indoor Meet","Alpine and Winter","Competition","Social","Journal","Librarian","Webmaster"],
    'body' : [
                ["2018-2019","Holly Rowland","Izzy Bentley","Sophie Miocevich","Elin Falla","Omar Shah & Timo Zheng","Alex Nicol & Bethan Morris","Charlie Fraser","Ed Mabon","Joe Taylor & Sophia Georgescu","Sophie Miocevich","Francesca Rigg","Daniel Wainwright"],
                ["2017-2018","Ed Wheatcroft","Jemima Churchhouse","Gwilym Rowbottom","Sophie Miocevich","Ed Bray & Robert Morse","Holly Rowland & Alice Kirk","James Kent","Timo Zheng","Isabella Bentley & Joe Taylor","Jia Yuan Loke & Charlie Fraser","Jia Yuan Loke & Charlie Fraser","James Lomax"],
                ["2016-2017","Gwilym Rowbottom","Kris Cao","Liat Adler","George Harding-Perrott","Ed Wheatcroft & Alex Law","Ed Bray","Cameron Holloway","Isabella Bentley","Roberto Cecere & Jemima Churchhouse","none","Gwilym Rowbottom",""],
                ["2015-2016","Philip Glass","Daniel Zheng","Matthew Wong","Veronika Siska","Ed Wheatcroft & Andrew Cherenkov","Kris Cao","Will Kernick","Gwilym Rowbottom","Ed Bray","Daniel Zheng","Rose Pearson",""],
                ["2014-2015","Tom Hare","Laurent Michaux","Luke Bounds","Daniel Zheng","Alexander Law","Helen Fox & Liam Carter","Rose Pearson","Philip Glass","Lucy Sawyer","Cameron Holloway","Evan Miles",""],
                ["2013-2014","Liam Carter","Laurence Cowton","Luke Bounds","Philip Glass","Daniel Zheng and Thomas Geh","Daniel Zheng and Thomas Geh","Tom Hare","Amelia Fischer-Linnett","Nick Jarman and Laurence Orchard","Jack Ogden and Nick Jarman","Evan Miles",""],
                ["2012-2013","Laurence Cowton","Fabian Jakubczik","Ed Feldman","Vincent Lister","Liam Carter","Liam Carter","Tom Hare (Alpine) & Ivo Dawkins (Winter)","Amelia Fischer-Linnett","Jack Ogden","Nick Jarman","Dawn Hollis",""]
            ]}

class CommitteeAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                head: oldCommittee.head,
                body: oldCommittee.body,
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
                        {committee.indoorMeets.map((i, key) => {
                            return (
                                <Col key={key}>
                                    <UserCard person={i} />
                                </Col>
                            )
                        })}
                        {committee.outdoorMeets.map((i, key) => {
                            return (
                                <Col key={key}>
                                    <UserCard person={i} />
                                </Col>
                            )
                        })}
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col>
                            <UserCard person={committee.gear} />
                        </Col>
                        <Col>
                            <UserCard person={committee.competitions} />
                        </Col>
                        <Col>
                            <UserCard person={committee.webmaster} />
                        </Col>
                        <Col>
                            <UserCard person={committee.winterMeets} />
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        {committee.socialMeets.map((i, key) => {
                            return (
                                <Col md={3} key={key}>
                                    <UserCard person={i} />
                                </Col>
                            )
                        })}
                        <Col md={3}>
                            <UserCard person={committee.journal} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Past Committees</Card.Title>
                                    <Card.Subtitle>
                                        Here you can find the committees of years past.
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover>
                                        <div  style={{fontSize: 9}}>{/*can't get responsive table to work inside card*/}
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
                                        </div>
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