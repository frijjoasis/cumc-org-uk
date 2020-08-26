import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";

import img from '../../../assets/img/competitions-1.jpg'

const competitionsAbout = [
    "Here you can learn more about the competitions we'll be running and taking part in over the year. Further " +
    "information on all these events will be released nearer the time, and the calendar will be regularly updated for " +
    "forward planning. We have ordered the competition types to reflect how serious and challenging they are.",
    <br />,
    <h3>Cuppers</h3>,
    "This is our Inter-Collegiate competition, which will take place at Rainbow Rocket each term. You will be given " +
    "a score sheet of problems to climb: tick them off as you go and write whether or not you did it on your first " +
    "attempt too. You'll have a few weeks to try all the climbs and get as many done as you can. Once you've " +
    "finished, submit your score as the score sheet instructs. The results will be announced shortly after the " +
    "competition period has ended. There will be a large range in the difficulty of the problems chosen so there is " +
    "no need for previous competition experience. The winning college will be presented with our Cuppers trophy.",
    <br />,
    <h3>Varsity</h3>,
    "A competition where we take on Oxford! Date and venue will be announced nearer the time, but will probably take " +
    "place at a wall in London during Lent term. There is no limit to how many people we can enter, so let's get as " +
    "big a team as possible! This is fairly relaxed, so try it out if you're new to climbing competitions.",
    <br />,
    <h3>London University Bouldering Event (LUBE)</h3>,
    "These are a series of competitions which are run by London universities and take place in centres around " +
    "London. We can enter a team of 8 (minimum 2 of each gender). The usual plan is to take the train down together, " +
    "compete, and return the same afternoon. No competition experience is required, although we will select on " +
    "ability if oversubscribed.",
    <br />,
    <h3>BUCS</h3>,
    "The national bouldering competition! This will be in Sheffield at some point in Lent term, and a small group of " +
    "us will be able to compete. This is a serious competition, and club members will gain most from the experience " +
    "if they are regular competitors."
];

class CompetitionsAbout extends React.Component {
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
                    <Row className="justify-content-center">
                        <Col style={{flex: 0}}>
                            <Card>
                                <Image src={img} />
                                <Card.Footer className="text-center text-muted">Varsity 2020</Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Competitions</h2>
                                    <p>{competitionsAbout}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default CompetitionsAbout;