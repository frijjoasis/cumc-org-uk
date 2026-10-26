import { Router, Request, Response } from 'express';
import { meetService, signupService } from '../../services/index.js';
import { logger } from '../../logger.js';
import { committeeAuth, userAuth } from '../middleware.js';
import {
  canVoidPayment,
  isFreeMeet,
  needsNewPayment,
  voidSignup,
} from '../paypal/committeePayments.js';
import { PayPalClient } from '../paypal/paypalClient.js';

const router: Router = Router();
const paypalClient = new PayPalClient();

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

/**
 * What the public meet page may see. Logged-out visitors get the meet itself
 * and a signup count. Signed-in users also get who is going (names only), the
 * organiser's contact details, and their own signup.
 */
export function toPublicMeet(meet: any, viewerID: string | null) {
  const {
    signups = [],
    organiserUser,
    organiser: _organiserID,
    ...details
  } = meet.toJSON();
  const base = { ...details, signupCount: signups.length };
  if (!viewerID) return base;

  const mine = signups.find((s: any) => s.userID === viewerID);
  return {
    ...base,
    signups: signups.map((s: any) => ({ displayName: s.displayName })),
    organiser: organiserUser
      ? {
          firstName: organiserUser.firstName,
          lastName: organiserUser.lastName,
          phone: organiserUser.phone,
        }
      : null,
    mySignup: mine
      ? {
          answers: mine.answers,
          needsPayment: !isFreeMeet(meet.price) && needsNewPayment(mine),
        }
      : null,
  };
}

router.post('/view', async function (req: Request, res: Response) {
  try {
    const meet = await meetService.getByIdRestricted(req.body.id);
    if (meet) {
      const viewerID = req.isAuthenticated() ? req.user.id.toString() : null;
      res.json(toPublicMeet(meet, viewerID));
    } else {
      res.json({ err: 'Database error: Could not find meet' });
    }
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
});

export const handleEditOrCreate = async (req: Request, res: Response) => {
  try {
    // Only trust the id from the URL, so /new can never overwrite an existing meet
    const { id: _bodyId, ...body } = req.body;
    const meetData = req.params.id
      ? { ...body, id: parseInt(req.params.id) }
      : body;

    const [meet] = await meetService.upsert(meetData, req.user!.id.toString());

    if (meet) {
      res.json(meet);
    } else {
      res.status(400).json({ err: 'Operation failed' });
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

/**
 * Deleting a signup also deletes its authorization ID, after which nobody
 * can release the member's held money. Void any hold first, and keep the
 * signup (recording what PayPal said) if that fails.
 */
export async function handleDeleteSignup(req: Request, res: Response) {
  try {
    const signup = await signupService.getById(req.body.id);
    if (!signup) return res.json(true);

    if (canVoidPayment(signup)) {
      const outcome = await voidSignup(paypalClient, signup.authID!, {
        intent: 'register',
        userID: signup.userID?.toString(),
        performedBy: req.user!.id,
        signupID: signup.id,
      });
      if (outcome.result === 'failed') {
        await signupService.updatePayment(signup.id, outcome.store);
        return res.json({
          err: "Couldn't release this member's payment hold, so the signup was not deleted. See the Payment column for what PayPal said.",
        });
      }
    }

    await signupService.delete(signup.id);
    res.json(true);
  } catch (err: any) {
    logger.error('Database error: ', err);
    res.json({ err: 'Database error: Please contact the webmaster' });
  }
}

router.post('/deleteSignup', committeeAuth, handleDeleteSignup);

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
  const history = await signupService.getHistory(req.user!.id.toString());
  res.json(history);
});

export default router;
