import React from "react";
import {Navbar, Nav, NavItem, NavDropdown} from "react-bootstrap";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
        this.state = {
            sidebarExists: false
        };
    }

    mobileSidebarToggle(e) {
        if (this.state.sidebarExists === false) {
            this.setState({
                sidebarExists: true
            });
        }
        e.preventDefault();
        document.documentElement.classList.toggle("nav-open");
        let node = document.createElement("div");
        node.id = "bodyClick";
        node.onclick = function() {
            this.parentElement.removeChild(this);
            document.documentElement.classList.toggle("nav-open");
        };
        document.body.appendChild(node);
    }

    render() {
        return (
            <Navbar fluid variant="default" sticky="top">
                <Navbar.Brand>{this.props.brandText}</Navbar.Brand>
                <Navbar.Toggle onClick={this.mobileSidebarToggle} />
                <Navbar.Collapse>
                    <Nav className="ml-auto">
                        <Nav.Link href="#">Login</Nav.Link>
                        <Nav.Link eventKey={2} href="">
                            Register
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;