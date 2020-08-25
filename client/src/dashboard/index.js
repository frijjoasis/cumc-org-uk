import React from 'react';
import axios from 'axios';
import Helmet from "react-helmet";
import routes from './routes';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Navbar/Navbar';
import {Switch, Route, Redirect} from 'react-router-dom';

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
        return "Home";
    };

    componentDidMount() {
        axios.get('/api/index').then(res => {
            this.setState({
                content: res.data,
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
                    <Header {...this.props} brandText={this.getBrandText()} />
                    <Switch>
                        {routes.map((prop, key) => {
                            if (!prop.category) {
                                return (
                                    <Route
                                        exact
                                        path={prop.layout + prop.path}
                                        component={prop.component}
                                        key={key}
                                    />
                                );
                            }
                        })}
                        <Redirect to="/home" />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default Frame;