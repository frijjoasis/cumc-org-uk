#!/usr/bin/env node
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '.env') });

import express, { Request, Response } from 'express';
import passport from 'passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import session from 'express-session';
import * as database from './database/database';
import { logger, expressLogger } from './logger';
import { userService } from './services';

import aboutRouter from './routes/about/about';
import committeeRouter from './routes/committee/committee';
import authRouter from './routes/auth/auth';
import userRouter from './routes/user/user';
import meetsRouter from './routes/meets/meets';
import memberRouter from './routes/member/member';
import paypalRouter from './routes/paypal/paypal';
import mailmanRouter from './routes/mailman/mailman';

const routers = [
  { path: '/api/about/', router: aboutRouter },
  { path: '/api/committee/', router: committeeRouter },
  { path: '/api/auth/', router: authRouter },
  { path: '/api/user', router: userRouter },
  { path: '/api/meets', router: meetsRouter },
  { path: '/api/member', router: memberRouter },
  { path: '/api/paypal', router: paypalRouter },
  { path: '/api/mailman', router: mailmanRouter },
];

const app = express();
const port = process.env.PORT || 5000;

app.use(expressLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.enable('trust proxy');

app.use(express.static(path.join(__dirname, 'public'))); // Serve everything in public at /
app.use(express.static(path.join(__dirname, '../client/build')));

interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
}

passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      callbackURL: '/api/auth/callback',
      proxy: true,
    } as any,
    function (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: Express.User) => void
    ) {
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value || '',
      };
      userService.getById(profile.id).then(() => {
        done(null, user as any);
      });
    }
  )
);
passport.serializeUser(function (user: Express.User, done) {
  done(null, user);
});

passport.deserializeUser(function (user: Express.User, done) {
  // Dev users don't exist in the database, so just return them as-is
  if ((user as any).isDevUser) {
    return done(null, user);
  }
  done(null, user);
});

app.use(
  session({
    secret: process.env.SECRET || '',
    resave: false,
    // secure: process.env.NODE_ENV === 'production',
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

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
}); // Serve react app

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
