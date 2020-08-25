import React from 'react';
import axios from 'axios';
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import Carousel from '../../../components/Carousel/Carousel';

const slides = [
    {
        img: require('../../../assets/img/carousel/trad.jpg'),
        header: "Trad Climbing",
        desc: "Nulla vitae elit libero, a pharetra augue mollis interdum.",
    },
    {
        img: require('../../../assets/img/carousel/bouldering.jpg'),
        header: "Bouldering",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
        img: require('../../../assets/img/carousel/alpine.jpg'),
        header: "Alpine",
        desc: "Praesent commodo cursus magna, vel scelerisque nisl consectetur.",
    },
]

const aboutText = ["We’re active in pretty much all areas of mountaineering and climbing, from indoor bouldering, " +
    "to outdoor sport and trad climbing, right up to winter and alpine climbing. You don’t have to have any prior " +
    "experience of climbing to join, so if you're at all interested in mountaineering or climbing we'd like to meet " +
    "you. If you’re joining us as a fresher in October we’ll have a number of freshers’ events coming up in the first " +
    "few weeks of term and we’ll be at the CUSU societies fair. If you’re joining later in the year then fear not! " +
    "We run weekly bouldering socials throughout the year which you can attend without paying membership, so come " +
    "along and say hi!", <br />, <br />,
    "If you want to find out more about what we do then have a look at the upcoming meets below (they should start " +
    "appearing just before the start of each term). You can also create an account on the website and sign up to our " +
    "mailing list for free, which will mean you'll get our weekly bulletin and find out what we’ve got going on each " +
    "week. We also have a Facebook page. If you've got any questions then feel free to email one of us! " +
    "Hopefully see you climbing soon!"];

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: false
        }
    }

    componentDidMount() {
        axios.get('/api/index').then(res => {
            this.setState({
                content: res.data,
            })
        })
    }

    render() {
        return (
            <div className="content">
                <Container fluid>
                    <Row>
                        <Col md={8}>
                            <Card>
                                <Carousel slides={slides} />
                            </Card>
                        </Col>
                        <Col md={4} className="d-flex flex-column">
                            <Card className="flex-grow-1">
                                <Card.Body>
                                    <Card.Title>Welcome!</Card.Title>
                                    <Card.Subtitle>You are not signed in</Card.Subtitle>
                                    <Card.Text>
                                        Some quick example text to build on the card title and make up the bulk of
                                        the card's content.
                                    </Card.Text>
                                    <Row>
                                        <Col>
                                            <Button className="float-right">Login</Button>
                                            <Button className="float-right">Signup</Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h3>About Us</h3>
                                    <p>{aboutText}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Home;