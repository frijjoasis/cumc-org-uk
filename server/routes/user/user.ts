import { Router, Request, Response } from 'express';
import { userService } from '../../services/index.js';
import { logger } from '../../logger.js';
import { userAuth, committeeAuth } from '../middleware.js';

const router: Router = Router();

router.get('/', userAuth, function (req: Request, res: Response) {
  res.json({
    user: req.user,
  });
});

export async function handleRegister(req: Request, res: Response) {
  try {
    const required = await userService.getRequiredFields();
    const body = req.body ?? {};
    const missingFields = required.filter(
      field => typeof body[field] !== 'string' || body[field].trim() === ''
    );
    if (missingFields.length > 0) {
      return res.json({
        err: 'Please fill in all the required profile fields.',
        missingFields,
      });
    }

    await userService.updateInfo(body, req.user!.id);
    res.json(true);
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
}

router.post('/register', userAuth, handleRegister);

router.get(
  '/missing',
  userAuth,
  async function (req: Request, res: Response) {
    try {
      const missingFields = await userService.getMissingProfileFields(
        req.user!.id
      );
      res.json({ missingFields });
    } catch (err: any) {
      logger.error('Database error: ', err);
      res
        .status(500)
        .json({ err: 'Database error: Please contact the webmaster' });
    }
  }
);

router.get('/info', userAuth, async function (req: Request, res: Response) {
  const user = await userService.getById(req.user!.id);
  res.json(user);
});

router.post(
  '/member',
  committeeAuth,
  async function (req: Request, res: Response) {
    try {
      const user = await userService.getWithMember(req.body.id);
      res.json(user);
    } catch (err: any) {
      logger.error('Database err: ', err);
      res.json({ err: 'Database error: Please contact the webmaster' });
    }
  }
);

router.get(
  '/list',
  committeeAuth,
  async function (req: Request, res: Response) {
    const list = await userService.list();
    res.json(list);
  }
);

router.get(
  '/lookup/:query',
  committeeAuth,
  async function (req: Request, res: Response) {
    try {
      const user = await userService.getByCrsidOrId(req.params.query);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      logger.error('Lookup Error: ', err);
      res.status(500).json({ error: 'Internal server error during lookup' });
    }
  }
);
export default router;
