import { Router, Request, Response } from 'express';
import { memberService } from '../../services';
import { logger } from '../../logger';
import { userAuth, rootAuth } from '../middleware';

const router = Router();

router.get('/', userAuth, async function (req: Request, res: Response) {

  try {
    const member = await memberService.getById(req.user.id);
    res.json({
      member: member,
    });
  } catch (err) {
    logger.error('Error fetching member:', err);
    res.status(500).json({ err: 'Internal Server Error' });
  }
});

router.get('/committee', async function (req: Request, res: Response) {
  const defaultStatus = { isCommittee: false, isRoot: false, roles: [] };

  if (!req.isAuthenticated()) {
    return res.json(defaultStatus);
  }

  try {
    const role = await memberService.getCommitteeRole(req.user.id);
    return res.json(role);
  } catch (error) {
    logger.error('Error fetching committee role:', error);
    return res.json(defaultStatus);
  }
});

router.get('/reset', rootAuth, async function (req: Request, res: Response) {
  try {
    await memberService.resetAllMemberships();
    res.json(true);
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.status(500).json({ err: 'Database error: Please contact the webmaster' });
  }
});

router.post('/update', rootAuth, async function (req: Request, res: Response) {
  try {
    await memberService.updateMembership(req.body.id, req.body.status);
    res.json(true);
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.status(500).json({ err: 'Database error: Please contact the webmaster' });
  }
});

export default router;