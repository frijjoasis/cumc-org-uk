#!/usr/bin/env node
require('dotenv').config({path: '/societies/cumc/cumc-org-uk/server/.env'});
const express = require('express');
const passport = require('passport');
const database = require('./database/database');
const users = require('./database/controllers/users');
const winstonLogger = require('./logger');
const path = require('path');
const RavenStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');

const routers = [
    {path: '/api/about/', router: require('./routes/about/about')},
    {path: '/api/gear/', router: require('./routes/gear/gear')},
    {path: '/api/committee/', router: require('./routes/committee/committee')},
    {path: '/api/auth/', router: require('./routes/auth/auth')},
    {path: '/api/user', router: require('./routes/user/user')},
    {path: '/api/meets', router: require('./routes/meets/meets')},
    {path: '/api/member', router: require('./routes/member/member')},
    {path: '/api/paypal', router: require('./routes/paypal/paypal')},
    {path: '/api/mailman', router: require('./routes/mailman/mailman')},
];

const app = express();
const port = process.env.PORT || 5000;

app.use(winstonLogger.expressLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.enable('trust proxy');

app.use(express.static('public/journals')); // Statically serving journals
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

const logger = winstonLogger.logger;
logger.info(`Checking database connection...`);
database.init().then(() => {
    logger.info('Database initialised.');
}).catch((error) => {
    logger.error('Unable to connect to the database:', error);
});

app.listen(port, () => logger.info(`Listening on port ${port}`));