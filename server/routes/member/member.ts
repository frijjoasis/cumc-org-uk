import { Router, Request, Response } from 'express';
import { memberService } from '../../services';
import { logger } from '../../logger';
import { userAuth, rootAuth } from '../middleware';

const router = Router();

router.get('/', userAuth, async function (req: Request, res: Response) {
  // Handle dev users - they don't exist in the database
  if ((req.user as any).isDevUser) {
    return res.json({
      member: {
        id: req.user.id,
        hasPaid: true,
        hasFree: false,
        committee: 'Dev Admin',
      },
    });
  }

  const member = await memberService.getById(req.user.id);
  res.json({
    member: member,
  });
});

router.get('/committee', async function (req: Request, res: Response) {
  if (req.isAuthenticated()) {
    // Dev users have full committee access
    if ((req.user as any).isDevUser) {
      return res.json('Dev Admin');
    }

    const role = await memberService.getCommitteeRole(req.user.id);
    res.json(role);
  } else {
    res.json(false);
  }
});

router.get('/reset', rootAuth, async function (req: Request, res: Response) {
  try {
    await memberService.resetAllMemberships();
    res.json(true);
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

router.post('/update', rootAuth, async function (req: Request, res: Response) {
  try {
    await memberService.updateMembership(req.body.id, req.body.status);
    res.json(true);
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

export default router;
