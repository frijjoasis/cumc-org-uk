import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import {NavLink} from "react-router-dom";
import Image from "react-bootstrap/Image";

import img from "../../../assets/img/outdoor-1.jpg";

const outdoorMeets = [
    <h3>Kinds of outdoor meet</h3>,
    "Every weekend (weather permitting) we’ll drive up to the Peak District (usually) to a crag selected by the " +
    "outdoor meet secs. This is the “standard” outdoor meet, and are always a lot of fun! These trips last a whole " +
    "day, leaving at 0700 sharp and get back in the evening sometime, depending on the time of year. We’ll look at " +
    "the preferences of those that sign up, as well as the weather forecast, to choose whether we go on Saturday or " +
    "Sunday.", <br />, <br />,
    "Once a term we also try and go away for a weekend somewhere. In the past, we’ve had weekends in North Wales or " +
    "the Peak District, but if you’ve got a favourite place to go then let us know! We usually book a bunkhouse out " +
    "for these trips so we don’t need to camp. As well as some fantastic climbing, you can expect a nice meal and " +
    "lots of bunkhouse fun and games! The ever-popular sock wrestling or table mountaineering are bound to make an " +
    "appearance at some point over the weekend! We also now have a special CUMC edition of Cards Against Humanity, " +
    "endorsed by current and former presidents of the Club.", <br />, <br />,
    "The pinnacle of outdoor meets happens after May Week every year: the annual meet. This is a week long trip " +
    "somewhere far from Cambridge: in the past we’ve been to places such as Cornwall, North Wales, and " +
    "Pembrokeshire. Signup for this normally opens around the start of Easter term, so keep on the lookout around " +
    "then for more details!", <br />, <br />,
    "We also run a 'Winter Sun' trip. This happens soon after Michaelmas term ends and sees the club travel off to " +
    "somewhere nice and sunny (unlike the UK in December!) for a week’s sport climbing. In 2019 we went to Antalya " +
    "in Turkey, who knows where we’ll go this year?",
    <br />, <br />,
    <h3>What kind of climbing happens on outdoor meets?</h3>,
    "Since the majority of the trips take place in the Peak District, trad climbing is the standard. There’s also " +
    "lots of bouldering up there, so if you fancy that let the outdoor meet sec organising the trip know. Whether " +
    "it’s possible or not depends on if there’s room in the car for a boulder pad! If you’re a super keen sport " +
    "climber let us know and we’ll see if we can try and organise a trip more to your tastes.",
    <br />, <br />,
    <h3>What you need to know</h3>,
    "We require that those going on outdoor meets know how to LEAD BELAY. If you don’t, then you’ll spend lots of " +
    "the day sitting around and won’t have a good time. Or worse, someone might get hurt. We can teach you the " +
    "skills you need though: generally indoor meets are a good time for this. If you want to learn to lead trad then " +
    "we’re happy to show you (we usually run one meet per term geared towards this), but it’s definitely best if you " +
    "learn to lead indoors first or you may find it a little scarier than expected!",
    <br />, <br />,
    <h3>How much do they cost?</h3>,
    "This year, outdoor meets cost £15. Everyone pays this to the club, then the driver can claim back 25p per mile " +
    "to cover petrol and a small amount of “wear and tear”. If you signup to a meet, have your place confirmed then " +
    "find you can no longer go then email the organiser BEFORE 10AM on the Friday and they will refund you. No " +
    "refunds will be given after this time except in exceptional circumstances. If the entire meet is cancelled then " +
    "everyone will be refunded.",
    <br />, <br />,
    <h3>What to bring</h3>,
    "These trips happen throughout the year, so clearly this varies. As a bare minimum you’ll need a harness, " +
    "helmet, belay plate and climbing shoes on top of the stuff you’d normally take on a day out to the countryside " +
    "(warm clothes, sturdy shoes, lunch etc.). If you have climbing gear, such as your own rack or rope, that you’re " +
    "prepared to use then please bring them along. The club have some gear that can be lent to members, but if you " +
    "have your own then you’re likely to want to use it anyway! However you use personal gear on meets at your own " +
    "risk; the club won't cover the cost of damage or loss."
];

class OutdoorMeets extends React.Component {
    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Outdoor Meets</h2>
                                    <p>{outdoorMeets}</p>
                                    <Row>
                                        <Col>
                                            <NavLink className="float-right btn btn-primary" to="/meets/upcoming">
                                                View Meets
                                            </NavLink>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            <Row className="justify-content-center">
                                <Col style={{flex: 0}}>
                                    <Card>
                                        <Image src={img} />
                                        <Card.Footer className="text-center text-muted">
                                            ~something outdoors~
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default OutdoorMeets;