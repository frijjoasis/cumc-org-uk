const express = require('express');
const path = require('path');
const passport = require('passport');
const RavenStrategy = require('passport-raven');
const session = require('express-session');
const logger = require('morgan');

require('dotenv').config();

const routers = [
    {path: '/api/', router: require('./routes/index')},
    {path: '/api/about/', router: require('./routes/about/about')},
    {path: '/api/gear/', router: require('./routes/gear/gear')},
    {path: '/api/committee/', router: require('./routes/committee/committee')},
    {path: '/api/auth/', router: require('./routes/auth/auth')},
];

const app = express();

const port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new RavenStrategy({
    desc: 'Cambridge University Mountaineering Club',
    msg: 'you are required to identify yourself to the society.',
    debug: process.env.NODE_ENV !== 'production',
    audience: 'http://localhost:5000',
    //TODO:
}, function (crsID, params, done) {
    done(null, {id: crsID});
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid.cumc',
}));

app.use(passport.initialize());
app.use(passport.session());
//TODO: A session store actually meant for production. Good thing I read the docs!
//TODO: secure: true (and therefore SSL)

routers.forEach(i => {
    app.use(i.path, i.router);
});

app.listen(port, () => console.log(`Listening on port ${port}`));