import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import { logger } from '../../logger.js';
import { userAuth } from '../middleware.js';

const router: Router = Router();

interface MailLists {
  add: {
    'cumc-official': string[];
    'cumc-freshers': string[];
    'cumc-oldgits': string[];
  };
  remove: {
    'cumc-official': string[];
    'cumc-freshers': string[];
    'cumc-oldgits': string[];
  };
}

router.post('/update', userAuth, function (req: Request, res: Response) {
  fs.readFile(
    '/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json',
    (err, data) => {
      if (!err) {
        let lists: MailLists = JSON.parse(data.toString());

        const validLists: Array<
          'cumc-official' | 'cumc-freshers' | 'cumc-oldgits'
        > = ['cumc-official', 'cumc-oldgits', 'cumc-freshers'];

        // This input will be fed to a shell, so we need sanitise it
        (['add', 'remove'] as Array<'add' | 'remove'>).forEach(i => {
          validLists.forEach(l => {
            lists[i][l] = lists[i][l].filter(
              e => e !== (req.user as any).email
            );
            // Reset preferences

            if (req.body[i].includes(l))
              lists[i][l].push((req.user as any).email);
            // Add them to relevant array
          });
        });

        const listsStr = JSON.stringify(lists, null, 2);
        fs.writeFile(
          '/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json',
          listsStr,
          'utf-8',
          err => {
            if (!err) {
              logger.info(
                'Successfully updated mail.json for ' + (req.user as any).email
              );
              res.json(true);
            } else {
              logger.error('Failed to write to mail.json: ', err);
              res.json({
                err: 'Something went wrong. Please contact the webmaster.',
              });
            }
          }
        );
      } else {
        logger.error('Failed to read mail.json: ', err);
        res.json({
          err: 'Something went wrong. Please contact the webmaster.',
        });
      }
    }
  );
});

export default router;
