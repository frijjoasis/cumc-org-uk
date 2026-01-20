import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  type Profile,
} from 'passport-google-oauth20';
import session from 'express-session';

import * as database from './database/database.js';
import { logger, expressLogger } from './logger.js';
import { userService } from './services/index.js';

// Route Imports
import aboutRouter from './routes/about/about.js';
import committeeRouter from './routes/committee/committee.js';
import authRouter from './routes/auth/auth.js';
import userRouter from './routes/user/user.js';
import meetsRouter from './routes/meets/meets.js';
import memberRouter from './routes/member/member.js';
import paypalRouter from './routes/paypal/paypal.js';
import mailmanRouter from './routes/mailman/mailman.js';

// Recreating __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(expressLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.enable('trust proxy');

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client/build')));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      callbackURL: '/api/auth/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const userData = {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || '',
        };

        // userService.getById should handle find-or-create logic
        const user = await userService.getById(profile.id);
        return done(null, user as any);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.getById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(
  session({
    secret: process.env.SECRET || 'cumc',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid.cumc',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Register Routers
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

routers.forEach(route => app.use(route.path, route.router));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

try {
  logger.info('Initializing database...');
  await database.init();
  logger.info('Database initialized successfully.');

  app.listen(port, () => {
    logger.info(`Server running on port ${port} [${process.env.NODE_ENV}]`);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}
