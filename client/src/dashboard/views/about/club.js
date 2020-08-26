import React from 'react';
import axios from 'axios';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";

import img from "../../../assets/img/logo.png";

const clubAbout = [
    "The Cambridge University Mountaineering Club is one of the oldest climbing clubs in Britain. Founded in 1905, " +
    "it exists to help climbing students of the University make contact with one another and go climbing and " +
    "mountaineering.",
    <br />,
    "As a club we cater for members with a broad variety of climbing tastes. The current spectrum of climbing in the " +
    "club includes indoor climbing, scrambling, bouldering, rock climbing, ice climbing and alpine climbing.",
    <br />,
    "The club organises trips at the weekend and outings to climbing walls during the week, details of which can be " +
    "found in the meets section. Members often travel further afield during the holidays in informal groups to more " +
    "exotic locations.",
    <br />,
    "The club additionally owns a collection of books which is housed in the Wherry Library in Pembroke College.",
];

const historyAbout = [
    <h3>100th anniversary</h3>,
    "The club’s 100th anniversary was celebrated on 19th June 2005 with a dinner held at St Catherine’s College. " +
    "Following this meeting a number of articles were written by CUMC alumni to create the CUMC 100th Anniversary " +
    "edition journal. This contains a series of fascinating accounts of the history of the club, the talented " +
    "mountaineers involved, and the incredible trips that alumni have been a part of. The full series of articles " +
    "can be found ",
    <a href="https://drive.google.com/file/d/1szCqACkg-15GZ_SgyFMouP5wjtvCk6sT/view">here</a>, ".",
    <br />, <br />,
    "Additionally, the collection is now available in print (a 180 page colour volume containing all 28 articles). " +
    "If anyone would like to purchase a copy, costing £10 including postage, send an email to ",
    <a href="mailto:henry.edmundson@cantab.net">henry.edmundson@cantab.net</a>, ".",
    <br />, <br />,
    <h3>Brief history of the club</h3>,
    "What follows is an account of the club since its foundation in 1905. There is some controversy regarding the " +
    "exact nature of the clubs origin and reason for its foundation, and an attempt has been made to try and solve " +
    "this mystery. This history concentrates mainly on the club as an institution. The stories about prominent, and " +
    "dare I say famous, members are included in a separate hall of fame. There is also the beginnings of a CUMC new " +
    "route list which is continually being researched. Have a look at it to see just how involved CUMC members have " +
    "been in putting up new stuff. Also worth noting is that there were many famous mountaineers from before the " +
    "turn of the century who studied at Cambridge before the C.U.M.C. existed. Indeed a large number of the founding " +
    "members of the Alpine club were from Cambridge. The exploits of these great mountaineers can also be found in " +
    "the hall of fame.",
    <br />, <br />,
    "The foundation of the Cambridge University Mountaineering Club took place during the winter months of " +
    "1905-1906. Its founders were W. J. R. Calvert, who became the clubs first president, and Hugh Stewart, who " +
    "became the clubs first Hon. Secretary. Both men were from Trinity. Other known members of the club from this " +
    "time include H. B. Pilkington, E. F. Pilkington, C. R. Barran, H. C. Wilkinson (all Trinity), J. G. Drummond " +
    "(Christs), A. H. Ramsay (Pembroke) and N. L. Cappell. Initially the clubs activities involved arranging " +
    "lectures and talks about mountaineering, in particular Alpine climbing. At that time British rock climbing was " +
    "still in its infancy, and would have held no attraction to members whose aspirations were firmly fixed on " +
    "Alpine objectives and desires. The first lecture was given by Sir Martin Conway on 14th February, 1906, and the " +
    "lecture was followed by dinner in A. H. Ramsays rooms. The second outside lecturer was W. Cecil Slingsby; and " +
    "the third was Geoffrey Winthop Young. There had also been less informal meetings before the first lecture. It " +
    "is thought that the first was probably held in December 1905, where the president read a paper on the Alps, " +
    "where he had already gained some experience. The first Alpine dinner was on 19th May, 1906 and the second on " +
    "1st May, 1907. Menus from both these dinners were presented to the club in later years by one of the original " +
    "members, E. F. Pilkington who was the son of the great Alpine pioneer Charles Pilkington. There whereabouts is " +
    "currently unknown, and it seems unfortunate that they may have been since lost. What is known is that they ate " +
    "salmon, whitebait, roast lamb, asparagus and chocolate souffle on both occasions. The second menu was " +
    "apparently printed in French and the cover was graced with a colour photo of the Piz Rosegg, suggesting that " +
    "the club had some money to burn in those early days! However whilst its beginnings may have been successful, " +
    "the club had a difficult life until it died in 1914 with the onset of the Great War. There were no meets held " +
    "to go climbing as we know, although the club met regularly for teas in Mr. Valentine-Richards room in Christs. " +
    "Kenneth Tallerman, R.A.M.C., was the very last Hon. Secretary to be elected in August 1914, with the " +
    "appointment to begin in October. However both he and the outgoing Hon. Secretary, C. G. Crawford left for the " +
    "front and the minute books (or book) were never transferred, and disappeared, leaving the early history of the " +
    "club shrouded in mist.",
    <br />, <br />,
    "Since its reformation in 1920, the club has changed little. Operating on an evolving three year life cycle, the " +
    "club has had its ups and downs, yet still the traditions of teas, meets and lectures continue. Certainly the " +
    "greatest asset the club can provide, that of being a focal point for meeting other climbers and fostering an " +
    "interest in beginners still remains.",
    <br />, <br />,
    "A major point in the development of the club came at the very end of 1954 when the inaugural meet of the Magogs " +
    "was held at Black Rock Cottage in Glencoe on 31st December 1954. This club was similar to the C.U.M.C., in that " +
    "it was a climbing club, but open only to women, in contrast to the C.U.M.C. which at that time was open only to " +
    "men. The Magogs are actually a small range of hills south of Cambridge. The club had a very difficult time " +
    "surviving and it was not until 1962 that the club was finally amalgamated with the C.U.M.C. There is scant " +
    "mention of this major point in the minutes, perhaps owing to the embarrassing controversy it undoubtedly " +
    "generated.",
    <br />, <br />,
    "The club is still one of the most active student clubs in the country, with just over 100 members. Although " +
    "no-one is currently at the cutting edge, such as Al Rouse new routeing E5 before even coming up(!), there is " +
    "still a spirit of exploration with recent new routeing expeditions to Greenland and Mongolia. Hopefully this " +
    "progressive trend will continue into the future. Who knows what it may hold?"
];

class ClubAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: {
                head: ["Date", "Climbers", "Name", "Grade", "Location"],
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
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>About CUMC</h2>
                                    <p>{clubAbout}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col style={{flex: 0}}>
                            <Card>
                                <Image className="logo-cumc" rounded src={img} />
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Body>
                                    <h2>Club History</h2>
                                    <p>{historyAbout}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card ctTableFullWidth ctTableResponsive>
                                <Card.Body>
                                    <Card.Title>New Routes</Card.Title>
                                    <Card.Subtitle>
                                        This is a list of some of the routes first climbed by CUMC members.
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

export default ClubAbout;