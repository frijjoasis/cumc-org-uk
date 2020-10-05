#!/usr/bin/env node
const express = require('express');
const passport = require('passport');
const database = require('./database/database');
const users = require('./database/controllers/users');

const fs = require('fs');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});

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

let accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})

app.use(logger('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../client/build')));

passport.use(new RavenStrategy({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/api/auth/callback',
        proxy: 'true'
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
    secure: true,
    saveUninitialized: false,
    name: 'connect.sid.cumc',
}));

app.use(passport.initialize());
app.use(passport.session());
//TODO: A session store actually meant for production

routers.forEach(i => {
    app.use(i.path, i.router);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
}); // Serve react app

console.log(`Checking database connection...`);
database.init().then(() => {
    console.log('Database initialised.');
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});

app.listen(port, () => console.log(`Listening on port ${port}`));