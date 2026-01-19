import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services';
import multer from 'multer';
import fs from 'fs';
import { getHashedFilename } from '../utils/hash';
import { CommitteeModel, CommitteeRoleModel } from '../database/models';
import { Op } from 'sequelize';

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let { year } = req.body;
    
    if (!year || !/^\d{4}(-\d{4})?$/.test(year)) {
        const currentYear = new Date().getFullYear();
        year = `${currentYear}-${currentYear + 1}`;
    }

    const uploadPath = `./public/img/committee/${year}`;

    try {
        await fs.promises.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
    } catch (err) {
        cb(err as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const id = req.body.id || 'unknown'; 
    const type = req.body.type || 'photo';
    const filename = `${getHashedFilename(id, type)}.jpg`;
    cb(null, filename);
  },
});

export const uploadCommitteePhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

async function committeeAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ err: 'You need to be signed in to do that!' });
  }

  try {
    const isRoot = await memberService.getUserIsRoot(req.user.id);
    
    if (isRoot) return next();

    const committeeMember = await CommitteeModel.findOne({
      where: {
        member_id: req.user.id,
        is_current: true, 
      },
    });

    if (committeeMember) return next();

    return res.status(403).json({ err: 'You need a committee role to do that!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: 'Internal Server Error' });
  }
}

const VALID_ROOT_YEARS = [
  process.env.CURRENT_YEAR, 
  process.env.PREVIOUS_YEAR
].filter(Boolean); 

async function rootAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ err: 'You need to be signed in to do that!' });
  }

  try {
    const isRoot = await memberService.getUserIsRoot(req.user.id); 
    if (isRoot) return next();

    const hasRootAccess = await CommitteeModel.findOne({
      where: {
        member_id: req.user.id,
        year: {
            [Op.in]: VALID_ROOT_YEARS 
        }
      },
      include: [
        {
          model: CommitteeRoleModel,
          as: 'committeeRole',
          where: {
            role_slug: {
              [Op.in]: ['webmaster', 'president'],
            },
          },
        },
      ],
    });

    if (hasRootAccess) return next();

    return res.status(403).json({
      err: 'You are not in the sudoers file. This incident will be reported.',
    });
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ err: 'Internal authorization error.' });
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
    return res.status(401).json({ err: 'You need to be signed in to do that!' });
  }
}

export { committeeAuth, userAuth, rootAuth };