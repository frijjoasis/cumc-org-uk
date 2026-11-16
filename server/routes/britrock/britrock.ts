import { Router, Request, Response } from 'express';
import type { PublicBritRockEvent } from '@cumc/shared-types';
import { britRockService, memberService } from '../../services/index.js';
import type { BritRockEventModel } from '../../database/database.js';
import { logger } from '../../logger.js';
import { committeeAuth } from '../middleware.js';
import { isInvalid, parseEventInput } from './validate.js';

const router: Router = Router();

export function toPublicEvent(
  event: BritRockEventModel,
  sold: number
): PublicBritRockEvent {
  const remaining =
    event.capacity === null ? null : Math.max(event.capacity - sold, 0);
  return { ...event.toJSON(), remaining, soldOut: remaining === 0 };
}

async function viewerIsCommittee(req: Request): Promise<boolean> {
  if (!req.isAuthenticated()) return false;
  return (await memberService.getCommitteeRole(req.user.id)).isCommittee;
}

/** The public page. Drafts are only shown to committee, as a preview. */
export async function handleGetEvent(req: Request, res: Response) {
  try {
    const event = await britRockService.getCurrentEvent();
    if (!event || (event.status === 'draft' && !(await viewerIsCommittee(req)))) {
      return res.json(null);
    }
    const sold = await britRockService.countTickets(event.id);
    res.json(toPublicEvent(event, sold));
  } catch (err) {
    logger.error('Failed to fetch BritRock event:', err);
    res.status(500).json({ err: 'Internal server error' });
  }
}

router.get('/', handleGetEvent);

export async function handleGetAdmin(req: Request, res: Response) {
  try {
    const event = await britRockService.getCurrentEvent();
    const tickets = event ? await britRockService.getTickets(event.id) : [];
    res.json({ event, tickets });
  } catch (err) {
    logger.error('Failed to fetch BritRock admin data:', err);
    res.status(500).json({ err: 'Database error: Please contact the webmaster' });
  }
}

router.get('/admin', committeeAuth, handleGetAdmin);

/** POST /admin creates next year's event; POST /admin/:id edits one. */
export async function handleSaveEvent(req: Request, res: Response) {
  const input = parseEventInput(req.body);
  if (isInvalid(input)) return res.status(400).json(input);

  try {
    const event = req.params.id
      ? await britRockService.updateEvent(Number(req.params.id), input)
      : await britRockService.createEvent(input);
    if (!event) return res.status(404).json({ err: 'Event not found' });

    logger.info('BritRock event saved', {
      eventID: event.id,
      status: event.status,
      performedBy: req.user!.id,
    });
    res.json(event);
  } catch (err) {
    logger.error('Failed to save BritRock event:', err);
    res.status(500).json({ err: 'Database error: Please contact the webmaster' });
  }
}

router.post('/admin', committeeAuth, handleSaveEvent);
router.post('/admin/:id', committeeAuth, handleSaveEvent);

export default router;
