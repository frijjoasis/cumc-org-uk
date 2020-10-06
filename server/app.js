#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const database = require('./database/database');
const users = require('./database/controllers/users');
const RavenStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');
const logger = require('morgan');

const routers = [
    {path: '/api/about/', router: require('./routes/about/about')},
    {path: '/api/gear/', router: require('./routes/gear/gear')},
    {path: '/api/committee/', router: require('./routes/committee/committee')},
    {path: '/api/auth/', router: require('./routes/auth/auth')},
    {path: '/api/user', router: require('./routes/user/user')},
    {path: '/api/meets', router: require('./routes/meets/meets')},
    {path: '/api/member', router: require('./routes/member/member')},
    {path: '/api/paypal', router: require('./routes/paypal/paypal')},
];

const app = express();

const port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

passport.use(new RavenStrategy({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/api/auth/callback'
    }, function(accessToken, refreshToken, profile, done) {
        const user = {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value
        }
        users.upsert(user).then(() => {
            done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user); //TODO:
});

passport.deserializeUser(function(user, done) {
    done(null, user); //TODO:
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

console.log(`Checking database connection...`);
database.init().then(() => {
    console.log('Database initialised.');
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});

app.listen(port, () => console.log(`Listening on port ${port}`));