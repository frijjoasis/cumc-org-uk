#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const passport = require('passport');
const database = require('./database/database');
const users = require('./database/controllers/users');
const winstonLogger = require('./logger');
const RavenStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');

const routers = [
  { path: '/api/about/', router: require('./routes/about/about') },
  { path: '/api/committee/', router: require('./routes/committee/committee') },
  { path: '/api/auth/', router: require('./routes/auth/auth') },
  { path: '/api/user', router: require('./routes/user/user') },
  { path: '/api/meets', router: require('./routes/meets/meets') },
  { path: '/api/member', router: require('./routes/member/member') },
  { path: '/api/paypal', router: require('./routes/paypal/paypal') },
  { path: '/api/mailman', router: require('./routes/mailman/mailman') },
];

const app = express();
const port = process.env.PORT || 5000;

app.use(winstonLogger.expressLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.enable('trust proxy');

app.use(express.static('public/journals')); // Statically serving journals
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve public files
app.use(express.static(path.join(__dirname, '../client/build')));

passport.use(
  new RavenStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: '/api/auth/callback',
      proxy: 'true',
    },
    function (accessToken, refreshToken, profile, done) {
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
      };
      users.upsert(user).then(() => {
        done(null, user);
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  // Dev users don't exist in the database, so just return them as-is
  if (user.isDevUser) {
    return done(null, user);
  }
  done(null, user);
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    secure: process.env.NODE_ENV === 'production',
    saveUninitialized: false,
    name: 'connect.sid.cumc',
  })
);

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

// Start server first, then try database
app.listen(port, () => {
  logger.info(`Listening on port ${port}`);

  // Try database connection in development mode
  if (process.env.NODE_ENV === 'development') {
    logger.info(`Checking database connection...`);
    database
      .init()
      .then(() => {
        logger.info('Database initialised.');
      })
      .catch(error => {
        logger.warn(
          'Database connection failed in development mode. Some features may not work:',
          error.message
        );
        logger.info(
          'Server will continue running without database connection.'
        );
      });
  } else {
    // In production, database is required
    logger.info(`Checking database connection...`);
    database
      .init()
      .then(() => {
        logger.info('Database initialised.');
      })
      .catch(error => {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
      });
  }
});
