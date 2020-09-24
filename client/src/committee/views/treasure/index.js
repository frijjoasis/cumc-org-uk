import React from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

class Treasure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        axios.get("/api/gear/list").then(res => {
            this.setState({
                content: res.data
            });
        });
    }

    render() {
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col>
                            <Card>
                                treasure
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Treasure;