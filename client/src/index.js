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