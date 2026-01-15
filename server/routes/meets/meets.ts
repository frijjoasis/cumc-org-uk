import { Router, Request, Response } from 'express';
import { meetService, signupService } from '../../services';
import { logger } from '../../logger';
import { committeeAuth, userAuth } from '../middleware';

const router = Router();

router.get('/upcoming', async function (req: Request, res: Response) {
  try {
    const upcoming = await meetService.getAllUpcoming();
    res.json(upcoming || []);
  } catch (err) {
    logger.error('Failed to fetch upcoming meets:', err);
    res.status(500).json({ err: 'Internal server error' });
  }
});

router.get('/all', committeeAuth, async function (req: Request, res: Response) {
  const all = await meetService.getAll();
  res.json(all);
});

router.post('/view', async function (req: Request, res: Response) {
  try {
    const meet = await meetService.getByIdRestricted(req.body.id);
    if (meet) {
      res.json(meet);
    } else {
      res.json({ err: 'Database error: Could not find meet' });
    }
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

const handleEditOrCreate = async (req: Request, res: Response) => {
  try {
    const [meet] = await meetService.create(req.body, req.user.id.toString());
    if (meet) {
      res.json(meet.id);
    } else {
      res.status(400).json({ err: 'Could not create or find that meet!' });
    }
  } catch (err: any) {
    logger.error('Database error: ', err);
    res
      .status(500)
      .json({ err: 'Database error: Please contact the webmaster' });
  }
};

router.post('/edit/:id', committeeAuth, handleEditOrCreate);
router.post('/new', committeeAuth, handleEditOrCreate);

router.post(
  '/edit/:id/questions',
  committeeAuth,
  async function (req: Request, res: Response) {
    try {
      const meetId = req.params.id;
      const { questions } = req.body;

      await meetService.updateQuestions(meetId, questions);
      res.json({ success: true });
    } catch (err: any) {
      logger.error('Database error updating questions: ', err);
      res
        .status(500)
        .json({ err: 'Database error: Please contact the webmaster' });
    }
  }
);

router.post(
  '/delete',
  committeeAuth,
  async function (req: Request, res: Response) {
    try {
      await meetService.delete(req.body.id);
      res.json(true);
    } catch (err: any) {
      logger.error('Database error: ', err);
      res.json({ err: 'Database error: Please contact the webmaster' });
    }
  }
);

router.post(
  '/deleteSignup',
  committeeAuth,
  async function (req: Request, res: Response) {
    try {
      await signupService.delete(req.body.id);
      res.json(true);
    } catch (err: any) {
      logger.error('Database error: ', err);
      res.json({ err: 'Database error: Please contact the webmaster' });
    }
  }
);

router.post(
  '/historyOther',
  committeeAuth,
  async function (req: Request, res: Response) {
    const history = await signupService.getHistory(req.body.id);
    res.json(history);
  }
);

router.get(
  '/signups/:id',
  committeeAuth,
  async function (req: Request, res: Response) {
    try {
      // Use req.params.id instead of req.body.id
      const meetId = req.params.id;
      const meet = await meetService.getByIdWithSignups(meetId);

      if (meet) {
        res.json(meet);
      } else {
        res.status(404).json({ err: 'Could not find that meet' });
      }
    } catch (err: any) {
      logger.error('Database error fetching signups: ', err);
      res.status(500).json({ err: 'Internal Server Error' });
    }
  }
);

router.get('/history', userAuth, async function (req: Request, res: Response) {
  const history = await signupService.getHistory(req.user.id.toString());
  res.json(history);
});

export default router;
