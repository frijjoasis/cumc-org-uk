import React from 'react';
import ReactDOM from 'react-dom';
import Frame from './dashboard';
import Admin from './committee';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

import "./assets/css/animate.min.css";
import "./assets/sass/light-bootstrap-dashboard-react.scss?v=1.3.0";
import "./assets/css/pe-icon-7-stroke.css";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
          <Route exact path='/login' component={() => {
              window.location.href = 'http://localhost:5000/api/auth/login';
              // Redirect to backend, since requests via <a> aren't proxied
              //TODO: window.location.href = 'http(s)://cumc.org.uk:5000/api/auth/login';
              return null;
          }}/>
          <Route path="/committee" render={(props) => <Admin {...props} />} />
          <Route path="/" render={(props) => <Frame {...props} />} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();