import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";

import {gearAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

import img from '../../../../assets/img/gear-1.jpg'

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

    render() {
		return (
			<div className="content">
				<Container>
					<AboutCard title="Gear" text={gearAbout} button={
						{
							type: "button",
							to: "https://docs.google.com/spreadsheets/d/1CD4WMZ0-YO_ki2htINSFLYlZnkNZbJTNwkMwCX5cu38",
							text: "Gear Spreadsheet"
						}
					} />
					<Row className="justify-content-center">
						<Col md={6}>
							<Card>
								<Image src={img} fluid />
								<Card.Footer className="text-center text-muted">Ari, the current Gear Sec</Card.Footer>
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		)
    }
}

export default GearAbout;
