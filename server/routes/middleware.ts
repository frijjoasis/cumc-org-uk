import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services';

const isDevAdmin = (req: Request) => 
  process.env.NODE_ENV === 'development' && 
  req.user?.id === 999999999 && 
  process.env.DEV_ADMIN_BYPASS === 'true';

async function committeeAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (req.isAuthenticated()) {
    if (isDevAdmin(req)) return next();

    const role = await memberService.getCommitteeRole(req.user.id);
    if (role) return next();
    
    return res.status(403).json({ err: 'You need a committee role to do that!' });
  }
  return res.status(401).json({ err: 'You need to be signed in to do that!' });
}

async function rootAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (req.isAuthenticated()) {
    // 1. Dev Admin acts as Root
    if (isDevAdmin(req)) return next();

    // 2. Standard Root check
    const role = await memberService.getCommitteeRole(req.user.id);
    if (role === 'root') return next();

    return res.status(403).json({
      err: 'You are not in the sudoers file. This incident will be reported.',
    });
  }
  return res.status(401).json({ err: 'You need to be signed in to do that!' });
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
