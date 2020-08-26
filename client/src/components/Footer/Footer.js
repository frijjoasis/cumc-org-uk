import React from "react";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

class Footer extends React.Component {
    render() {
        return (
            <footer className="footer">
                <Container fluid style={{display: "flex", justifyContent: "center"}}>
                    <nav>
                        <ul>
                            <li>
                                <a href="https://www.facebook.com/cumcofficial/">
                                    <i className="fa fa-facebook-square" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/cumcofficial">
                                    <i className="fa fa-instagram" />
                                </a>
                            </li>
                            <li>
                                <a href="">
                                    <i className="fa fa-whatsapp" />
                                </a>
                            </li>
                            <li>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="button-tooltip-2">Made by Edmund</Tooltip>}
                                >
                                <a href="https://github.com/frijjoasis/cumc-org-uk">
                                    <i className="fa fa-github" />
                                </a>
                                </OverlayTrigger>
                            </li>
                        </ul>
                    </nav>
                </Container>
            </footer>
        );
    }
}

export default Footer;