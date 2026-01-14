import { Router } from 'express';
import { userService } from '../../services';
import passport from 'passport';
import { UserModel } from '../../database/models';

const router = Router();

router.get(
  '/login',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    // @ts-ignore - hostedDomain is a valid option for Google OAuth
    hostedDomain: ['cam.ac.uk'],

    // This argument is required to obtain the Raven login box
  } as any)
);

router.get(
  '/login/other',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    // An alternative login for people without Raven accounts
  })
);

router.get('/logout', function (req, res) {
  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ err: 'Logout failed' });
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Replaced is missing
    userService.isProfileIncomplete(req.user.id).then(missing => {
      res.redirect(`/${missing ? 'register' : ''}`);
    });
  }
);

// Development-only routes
if (process.env.NODE_ENV === 'development') {
  // Bypass login for development
  router.get('/dev-login', function (req, res) {
    if (process.env.DEV_ADMIN_BYPASS !== 'true') {
      return res
        .status(403)
        .json({ err: 'Development admin bypass not enabled' });
    }

    const devUser = new UserModel({
      id: 999999999,
      email: 'dev-admin@cumc.org.uk',
      displayName: 'Development Admin',
      firstName: 'Development',
      lastName: 'Admin',
      dob: null,
      college: null,
      phone: null,
      address1: null,
      address2: null,
      postCode: null,
      city: null,
      country: null,
      emergencyName: null,
      emergencyPhone: null,
      bmc: null,
      medicalInfo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a fake dev user session
    req.login(devUser, function (err) {
      if (err) {
        console.error('Dev login error:', err);
        return res.status(500).json({ err: 'Failed to create dev session' });
      }

      console.log('🔓 DEV MODE: Logged in as development admin');
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({
          success: true,
          message: 'Logged in as development admin',
          user: req.user,
        });
      } else {
        return res.redirect('/'); 
      }
    });
  });

  // Check dev auth status
  router.get('/dev-status', function (req, res) {
    if (process.env.DEV_ADMIN_BYPASS !== 'true') {
      return res
        .status(403)
        .json({ err: 'Development admin bypass not enabled' });
    }

    res.json({
      authenticated: req.isAuthenticated(),
      user: req.user,
      devMode: true,
      adminBypass: process.env.DEV_ADMIN_BYPASS === 'true',
    });
  });
}

export default router;
