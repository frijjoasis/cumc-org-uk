import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {NavLink} from "react-router-dom";
import Table from "react-bootstrap/Table";

const gearSecLink = <NavLink to="/about/committee">gear sec</NavLink>

const gearAbout = [
    "The table below shows what equipment is owned by the club, along with its availability. At present it is not " +
    "an exhaustive list, please contact the ",
    gearSecLink, ".", <br />, <br />,
    " for more details. Gear can be borrowed and returned at regular \"teas\" during term time, which are advertised " +
    "via the mailing list. Outside term time please contact the ",
    gearSecLink, ".",
    <br />, <br />,
    "In term time, gear should be returned within one week of it being issued. If you want to keep it for longer, " +
    "then you need to contact the gear secretary to ‘renew’ it. If gear is not returned, and the gear sec is not " +
    "given a legitimate reason as to why (e.g. illness so couldn’t make the gear tea), then the borrower will be " +
    "expected to pay for the gear.",
    <br />, <br />,
    "If gear is lost or damaged, but the borrower had taken reasonable precautions to look after it, then the club " +
    "will cover the cost at their discretion. If the club decides that reasonable precautions weren't taken, then " +
    "you will be expected to cover the cost of replacement/repair, using the formula: ",
    <br />, <br />, <p className="text-center"><code>estimated value = cost * (1-age/recommend max age)</code></p>,
];

class GearAbout extends React.Component {
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
        axios.get("/api/gear/list").then(res => {
            this.setState({
                content: res.data
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
                                    <h2>Gear</h2>
                                    <span>{gearAbout}</span>
                                    <Row>
                                        <Col>
                                            <Button className="float-right"
                                                    href="https://docs.google.com/spreadsheets/d/1CD4WMZ0-YO_ki2htINSFLYlZnkNZbJTNwkMwCX5cu38"
                                            >Gear Spreadsheet</Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Gear Table</Card.Title>
                                    <Card.Subtitle>
                                        The loan status of club owned gear.
                                    </Card.Subtitle>
                                    <hr />
                                    <Table striped bordered hover responsive>
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

export default GearAbout;