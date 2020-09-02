import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {NavLink} from "react-router-dom";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: window.innerWidth
        };
    }

    updateDimensions() {
        this.setState({ width: window.innerWidth });
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand>{this.props.brandText}</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Nav>
                        {this.state.width <= 991 ? this.props.routes.map(prop => {
                            if (prop.category) {
                                return (
                                    <Navbar.Text>{prop.name}</Navbar.Text>
                                )
                            } else {
                                return (
                                    <NavLink to={prop.layout + prop.path} className="nav-link">
                                        {prop.name}
                                    </NavLink>
                                );
                            }
                        }) : null}
                    </Nav>
                    <hr />
                    <Nav className="ml-auto">
                        <NavLink className="nav-link" to="/home">Login</NavLink>
                        <NavLink className="nav-link" to="/home">Register</NavLink>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;