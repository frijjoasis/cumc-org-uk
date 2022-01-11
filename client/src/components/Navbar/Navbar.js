import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
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
                        {this.props.committee ? <NavLink to={this.props.committee.link}>
                            {this.props.committee.text}
                        </NavLink> : null}
                        {this.state.width <= 991 ? this.props.routes.map(prop => {
                            if (prop.category) {
                                return (
                                    <Navbar.Text>{prop.name}</Navbar.Text>
                                )
                            } else if (!prop.hide) {
                                return (
                                    <NavLink to={prop.layout + prop.path} className="nav-link">
                                        {prop.name}
                                    </NavLink>
                                );
                            } else return null;
                        }) : null}
                    </Nav>
                    <hr />
                    <Nav className="ml-auto">
                        {this.props.user ? [
                            <NavLink key="profile-link" className="nav-link" to="/register">Profile</NavLink>,
                            <Navbar.Text key="navbar-text" className="nav-link text-dark">Signed in as:
                                <NavLink to="/register">
                                    {" " + this.props.user.displayName}
                                </NavLink>
                            </Navbar.Text>,
                            <NavLink key="logout-text" className="nav-link" to="/logout">Logout</NavLink>
                        ] : [
                            <NavDropdown title="Login" alignRight id="account-nav-dropdown" >
                                <NavDropdown.Item>
                                    <NavLink key="login" className="nav-link" to="/login">Login</NavLink>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                    <NavLink key="register" className="nav-link" to="/login">Register</NavLink>
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item>
                                    <NavLink key="alternate" className="nav-link" to="/login/other">No Raven account?</NavLink>
                                </NavDropdown.Item>
                            </NavDropdown>,
                        ]}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;