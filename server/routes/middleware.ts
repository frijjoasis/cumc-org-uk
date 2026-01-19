import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services';
import multer from 'multer';
import fs from 'fs';
import { getHashedFilename } from '../utils/hash';
import { CommitteeModel, CommitteeRoleModel } from '../database/models';
import { Op } from 'sequelize';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { year } = req.body;
    const path = `./public/img/committee/${year}`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: (req, file, cb) => {
    const { id, type } = req.body;
    const filename = `${getHashedFilename(id, type)}.jpg`;
    cb(null, filename);
  },
});

export const uploadCommitteePhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const isDevAdmin = (req: Request) =>
  process.env.NODE_ENV === 'development' &&
  String(req.user?.id) === '999999999' && // Use string comparison
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

    return res
      .status(403)
      .json({ err: 'You need a committee role to do that!' });
  }
  return res.status(401).json({ err: 'You need to be signed in to do that!' });
}

async function rootAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ err: 'You need to be signed in to do that!' });
  }

  if (isDevAdmin(req)) return next();

  try {
    // Check if the user has EVER held a root-level role
    const hasRootAccess = await CommitteeModel.findOne({
      where: {
        member_id: req.user.id,
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

    if (hasRootAccess) {
      return next();
    }

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
    return res.json({ err: 'You need to be signed in to do that!' });
  }
}

export { committeeAuth, userAuth, rootAuth };
