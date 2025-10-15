import React from 'react';
import axios from 'axios';
import {Helmet, HelmetProvider} from "react-helmet-async";
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
        }).catch(err => {
            console.log('User not authenticated:', err.response?.status);
            // User not logged in, which is fine
        });
    
        axios.get('/api/member/committee').then(res => {
           if (res.data) {
               this.setState({
                   committee: {
                       link: '/committee/home',
                       text: 'Committee'
                   }
               })
           }
        }).catch(err => {
            console.log('Not a committee member:', err.response?.status);
            // User not in committee, which is fine
        });
    }

    render() {
        return (
            <div className="wrapper">
                <HelmetProvider>
                    <Helmet>
                        <title>{`CUMC ${this.getBrandText()}`}</title>
                    </Helmet>
                </HelmetProvider>
                <Sidebar
                    {...this.props}
                    routes={routes}
                    color={this.state.color}
                    image={this.state.image}
                />
                <div id="main-panel" className="main-panel">
                    <Header {...this.props} routes={routes} user={this.state.user} committee={this.state.committee}
                            brandText={this.getBrandText()} />
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
                            } else return null;
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