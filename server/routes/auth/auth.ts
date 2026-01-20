import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { userService } from '../../services/index.js';

const router: Router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get(
  '/login',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
    // @ts-ignore - hostedDomain limits login to @cam.ac.uk (Raven)
    hostedDomain: 'cam.ac.uk',
  } as any)
);

router.get(
  '/login/other',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'openid'],
  })
);

router.post('/logout', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    req.logout(err => {
      if (err) return res.status(500).json({ err: 'Logout failed' });
      res.status(200).json({ success: true });
    });
  } else {
    res.status(200).json({ success: true });
  }
});

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(destroyErr => {
      if (destroyErr) console.error('Session cleanup failed:', destroyErr);

      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.redirect(FRONTEND_URL);
    });
  });
});

router.get(
  '/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    try {
      const { user } = req;

      const isMissing = await userService.isProfileIncomplete(user!.id);

      const redirectPath = isMissing ? '/register' : '/';
      res.redirect(`${FRONTEND_URL}${redirectPath}`);
    } catch (error) {
      console.error('Callback redirect error:', error);
      res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
    }
  }
);

export default router;
