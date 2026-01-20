import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Op } from 'sequelize';
import { memberService } from '../services/index.js';
import { CommitteeModel, CommitteeRoleModel } from '../database/database.js';
import { getHashedFilename } from '../utils/hash.js';

const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    let year = req.body.year;
    
    if (!year || !/^\d{4}(-\d{4})?$/.test(year)) {
        const currentYear = new Date().getFullYear();
        year = `${currentYear}-${currentYear + 1}`;
    }

    const uploadPath = path.join(process.cwd(), 'public', 'img', 'committee', year);

    try {
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
    } catch (err) {
        cb(err as Error, uploadPath);
    }
  },
  filename: (req, _file, cb) => {
    // If id isn't in body yet, we fallback to a temp name or timestamp
    const id = req.body.id || Date.now().toString(); 
    const type = req.body.type || 'photo';
    const filename = `${getHashedFilename(id, type)}.jpg`;
    cb(null, filename);
  },
});

export const uploadCommitteePhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ err: 'You need to be signed in to do that!' });
};

export const committeeAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ err: 'Sign in required.' });
  }

  try {
    const isRoot = await memberService.getUserIsRoot(req.user.id);
    if (isRoot) return next();

    const committeeMember = await CommitteeModel.findOne({
      where: { member_id: req.user.id, is_current: true },
    });

    if (committeeMember) return next();

    res.status(403).json({ err: 'Committee access required.' });
  } catch (err) {
    res.status(500).json({ err: 'Auth check failed.' });
  }
};

const VALID_ROOT_YEARS = [process.env.CURRENT_YEAR, process.env.PREVIOUS_YEAR].filter(Boolean) as string[];

export const rootAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ err: 'Sign in required.' });
  }

  try {
    const isRoot = await memberService.getUserIsRoot(req.user.id); 
    if (isRoot) return next();

    const hasRootAccess = await CommitteeModel.findOne({
      where: {
        member_id: req.user.id,
        year: { [Op.in]: VALID_ROOT_YEARS }
      },
      include: [{
        model: CommitteeRoleModel,
        as: 'committeeRole',
        where: { role_slug: { [Op.in]: ['webmaster', 'president'] } },
      }],
    });

    if (hasRootAccess) return next();

    res.status(403).json({ err: 'You are not in the sudoers file. This incident will be reported.' });
  } catch (error) {
    res.status(500).json({ err: 'Internal authorization error.' });
  }
};