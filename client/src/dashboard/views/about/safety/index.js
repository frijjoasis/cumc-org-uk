import React from 'react';
import Container from "react-bootstrap/Container";

import {safetyAbout} from "./text";
import AboutCard from "../../../../components/AboutCard/AboutCard";

class SafetyAbout extends React.Component {
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
                    <AboutCard title="Safety Policy" text={safetyAbout} />
                </Container>
            </div>
        )
    }
}

export default SafetyAbout;