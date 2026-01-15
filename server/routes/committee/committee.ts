import { Router, Request, Response } from 'express';
import { committeeAuth } from '../middleware';
import { committeeService, committeeRoleService } from '../../services';

const router = Router();

// === COMMITTEE MEMBER ROUTES ===

router.get('/current', async (req: Request, res: Response) => {
  try {
    const committeeModels = await committeeService.getCurrent();

    // Transform the models using your shared service logic
    const exposedCommittee = await Promise.all(
      committeeModels.map(cm => committeeService.getExposedModel(cm))
    );

    res.json(exposedCommittee);
  } catch (error) {
    console.error('Error fetching current committee:', error);
    res.status(500).json({ error: 'Failed to fetch current committee' });
  }
});

// Admin route due to sensitive info (I dont want to have to change the database so ids can be shared)
router.get(
  '/admin/list',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const [current, staged] = await Promise.all([
        committeeService.getAdminDetails('current'),
        committeeService.getAdminDetails('staged'),
      ]);

      res.json({
        current,
        staged,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admin committee list' });
    }
  }
);

router.get('/staged', async (req: Request, res: Response) => {
  try {
    const committee = await committeeService.getStaged();

    const stagedCommittee = await Promise.all(
      committee.map(cm => committeeService.getExposedModel(cm))
    );

    res.json(stagedCommittee);
  } catch (error) {
    console.error('Error fetching staged committee:', error);
    res.status(500).json({ error: 'Failed to fetch staged committee' });
  }
});

router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await committeeService.getStatusSummary();
    res.json(status);
  } catch (error) {
    console.error('Error fetching committee status:', error);
    res.status(500).json({ error: 'Failed to fetch committee status' });
  }
});

router.get('/past', async (req: Request, res: Response) => {
  try {
    const exposedData = await committeeService.getPastExposed();
    res.json(exposedData);
  } catch (error) {
    console.error('Error fetching past committees:', error);
    res.status(500).json({ error: 'Failed to fetch past committees' });
  }
});

router.post('/members', committeeAuth, async (req: Request, res: Response) => {
  try {
    const member = await committeeService.create(req.body);
    res.json(member);
  } catch (error) {
    console.error('Error adding committee member:', error);
    res.status(500).json({ error: 'Failed to add committee member' });
  }
});

router.put(
  '/members/:id',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const member = await committeeService.update(
        Number(req.params.id),
        req.body
      );

      if (!member) {
        return res.status(404).json({ error: 'Committee member not found' });
      }

      res.json(member);
    } catch (error) {
      console.error('Error updating committee member:', error);
      res.status(500).json({ error: 'Failed to update committee member' });
    }
  }
);

router.delete(
  '/members/:id',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const deleted = await committeeService.delete(Number(req.params.id));

      if (!deleted) {
        return res.status(404).json({ error: 'Committee member not found' });
      }

      res.json({ message: 'Committee member deleted successfully' });
    } catch (error) {
      console.error('Error deleting committee member:', error);
      res.status(500).json({ error: 'Failed to delete committee member' });
    }
  }
);

router.post(
  '/transition-year',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const result = await committeeService.transitionYear();
      res.json(result);
    } catch (error: any) {
      console.error('Error transitioning committee year:', error);
      res.status(error.message.includes('No staged') ? 400 : 500).json({
        error: error.message || 'Failed to transition committee year',
      });
    }
  }
);

router.post(
  '/start-staging',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const { year } = req.body;

      if (!year) {
        return res.status(400).json({ error: 'Year is required for staging' });
      }

      const inProgress = await committeeService.isStagingInProgress();

      if (inProgress) {
        return res.status(400).json({
          error:
            'Committee staging already in progress. Clear staged committee first.',
        });
      }

      res.json({
        success: true,
        message: `Ready to stage committee for ${year}. Add members with status 'staged'.`,
        staging_year: year,
      });
    } catch (error) {
      console.error('Error starting committee staging:', error);
      res.status(500).json({ error: 'Failed to start committee staging' });
    }
  }
);

router.post(
  '/clear-staged',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const count = await committeeService.clearStaged();
      res.json({
        success: true,
        message: `Cleared ${count} staged committee members.`,
        cleared_count: count,
      });
    } catch (error) {
      console.error('Error clearing staged committee:', error);
      res.status(500).json({ error: 'Failed to clear staged committee' });
    }
  }
);

// === COMMITTEE ROLES ROUTES ===

router.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = await committeeRoleService.getAll();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching committee roles:', error);
    res.status(500).json({ error: 'Failed to fetch committee roles' });
  }
});

router.get('/roles/active', async (req: Request, res: Response) => {
  try {
    const roles = await committeeRoleService.getActive();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching active committee roles:', error);
    res.status(500).json({ error: 'Failed to fetch active committee roles' });
  }
});

router.get('/roles/status', async (req: Request, res: Response) => {
  try {
    const status = await committeeRoleService.getWithStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching committee roles status:', error);
    res.status(500).json({ error: 'Failed to fetch committee roles status' });
  }
});

router.post('/roles', committeeAuth, async (req: Request, res: Response) => {
  try {
    const role = await committeeRoleService.create(req.body);
    res.json(role);
  } catch (error: any) {
    console.error('Error creating committee role:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Role name or slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create committee role' });
    }
  }
});

router.put('/roles/:id', committeeAuth, async (req: Request, res: Response) => {
  try {
    const role = await committeeRoleService.update(
      Number(req.params.id),
      req.body
    );

    if (!role) {
      return res.status(404).json({ error: 'Committee role not found' });
    }

    res.json(role);
  } catch (error: any) {
    console.error('Error updating committee role:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Role name or slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update committee role' });
    }
  }
});

router.delete(
  '/roles/:id',
  committeeAuth,
  async (req: Request, res: Response) => {
    try {
      const result = await committeeRoleService.deactivate(
        Number(req.params.id)
      );

      if (!result.success) {
        return res.status(404).json({ error: result.message });
      }

      res.json({ message: result.message });
    } catch (error: any) {
      console.error('Error deleting committee role:', error);
      res
        .status(400)
        .json({ error: error.message || 'Failed to delete committee role' });
    }
  }
);

export default router;
