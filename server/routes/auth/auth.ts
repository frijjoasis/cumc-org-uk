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

router.post('/logout', function (req, res) {
  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ err: 'Logout failed' });
      }
      return res.status(200).json({ success: true, message: 'Logged out' });
    });
  } else {
    return res
      .status(200)
      .json({ success: true, message: 'Already logged out' });
  }
});

router.get('/logout', function (req, res) {
  const baseUrl = process.env.FRONTEND_URL || '';

  if (req.isAuthenticated()) {
    req.logout(function (err) {
      if (err) {
        console.error('Logout error:', err);
        return res.redirect(`${baseUrl}/?error=logout_failed`);
      }
      res.redirect(`${baseUrl}/`);
    });
  } else {
    res.redirect(`${baseUrl}/`);
  }
});

router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async function (req, res) {
    // Replaced is missing
    const baseUrl = process.env.FRONTEND_URL || '';
    try {
      const userId = String(req.user.id);
      const isMissing = await userService.isProfileIncomplete(userId);

      const redirectPath = isMissing ? '/register' : '/';
      res.redirect(`${baseUrl}${redirectPath}`);
    } catch (error) {
      console.error('Callback redirect error:', error);
      res.redirect(`${baseUrl}/?error=auth_failed`);
    }
  }
);

export default router;
