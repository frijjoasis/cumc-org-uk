import React from 'react';
import Container from 'react-bootstrap/Container';

import {gearAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

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
                </Container>
            </div>
        )
    }
}

export default GearAbout;