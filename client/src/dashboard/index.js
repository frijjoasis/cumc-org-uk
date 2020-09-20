import React from 'react';
import axios from 'axios';
import Helmet from "react-helmet";
import routes from './routes';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import {Switch, Route, Redirect} from 'react-router-dom';

import NotFound from '../404'

import image from "../assets/img/sidebar/sidebar.jpg";

class Frame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: "black",
            image: image,
        };
    }

    getBrandText() {
        for (let route of routes) {
            if (this.props.location.pathname.includes(route.layout + route.path)) {
                return route.name; // First matching path
            }
        }
        return "404";
    };

    componentDidMount() {
        axios.get('/api/user/').then(res => {
            this.setState({
                user: res.data.user,
            })
        })
    }

    render() {
        return (
            <div className="wrapper">
                <Helmet>
                    <title>{`CUMC ${this.getBrandText()}`}</title>
                </Helmet>
                <Sidebar
                    {...this.props}
                    routes={routes}
                    color={this.state.color}
                    image={this.state.image}
                />
                <div id="main-panel" className="main-panel">
                    <Header {...this.props} routes={routes} user={this.state.user} brandText={this.getBrandText()} />
                    <Switch>
                        {routes.map((prop, key) => {
                            if (!prop.category && ((prop.auth && this.state.user) || !prop.auth)) {
                                return (
                                    <Route
                                        exact
                                        path={prop.layout + prop.path}
                                        render={(props) =>
                                            <prop.Component user={this.state.user} {...props} />
                                        }
                                        key={key}
                                    />
                                );
                            }
                        })}
                        <Redirect exact from="/" to="/home" />
                        <Route path="/" component={NotFound} />
                    </Switch>
                    <Footer />
                </div>
            </div>
        );
    }
}

export default Frame;