#!/usr/bin/env node
// Run as a cron job every couple of hours
import * as fs from 'fs';
import { spawn } from 'child_process';

interface MailLists {
  add: {
    [key: string]: string[];
  };
  remove: {
    [key: string]: string[];
  };
}

const empty = JSON.stringify(
  {
    add: {
      'cumc-official': [],
      'cumc-freshers': [],
      'cumc-oldgits': [],
    },
    remove: {
      'cumc-official': [],
      'cumc-freshers': [],
      'cumc-oldgits': [],
    },
  },
  null,
  2
);

fs.readFile(
  '/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json',
  (err, data) => {
    if (!err) {
      try {
        const lists: MailLists = JSON.parse(data.toString());

        (['add', 'remove'] as Array<'add' | 'remove'>).forEach((i) => {
          Object.keys(lists[i]).forEach((list) => {
            const child = spawn(
              `/usr/local/bin/srcf-mailman-${i}`,
              i === 'add' ? ['-w', 'y', '-a', 'n', list] : ['-N', '-s', list]
            );
            if (child.stdin) {
              (child.stdin as any).setEncoding('utf-8');
              for (const e of lists[i][list]) {
                console.log(`${i} ${e} from ${list}`);
                child.stdin.write(e + '\r\n');
              }
              child.stdin.end();
            }
          });
        });
      } catch (err) {
        console.error('Failed to update mail preferences: ', err);
      }

      // Reset mail.json. We don't have to worry about this being asynchronous from the child processes, the file has already been read
      fs.writeFile(
        '/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json',
        empty,
        'utf-8',
        (err) => {
          if (!err) console.log('Reset mail.json successfully.');
          else console.error('Failed to write to mail.json: ', err);
        }
      );
    } else console.error('Failed to read mail.json: ', err);
  }
);
