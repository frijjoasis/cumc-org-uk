import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services';

async function committeeAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (req.isAuthenticated()) {
    const role = await memberService.getCommitteeRole(req.user.id);
    if (role) {
      return next();
    } else {
      return res.json({ err: 'You need a committee role to do that!' });
    }
  } else {
    return res.json({ err: 'You need to be signed in to do that!' });
  }
}

async function rootAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (req.isAuthenticated()) {
    const role = await memberService.getCommitteeRole(req.user.id);
    if (role === 'root') {
      return next();
    } else {
      return res.json({
        err: 'You are not in the sudoers file. This incident will be reported.',
      });
    }
  } else {
    return res.json({ err: 'You need to be signed in to do that!' });
  }
}

function userAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.json({ err: 'You need to be signed in to do that!' });
  }
}

export { committeeAuth, userAuth, rootAuth };
