#!/usr/bin/env node
// Run as a cron job every couple of hours
const fs = require('fs');
const spawn = require('child_process').spawn;

const empty = JSON.stringify({
    add: {
        "cumc-official": [],
        "cumc-freshers": [],
        "cumc-oldgits": []
    },
    remove: {
        "cumc-official": [],
        "cumc-freshers": [],
        "cumc-oldgits": []
    }
}, null, 2);

fs.readFile('/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json', (err, data) => {
    if (!err) {
        const lists = JSON.parse(data.toString());

        ["add", "remove"].forEach(i => {
            Object.keys(lists[i]).forEach(list => {
                let child = spawn(`srcf-mailman-${i}`, (i === "add") ? ['-w', 'y', '-a', 'n', list]
                    : ['-N', '-s', list]);
                child.stdin.setEncoding('utf-8');
                child.stdout.pipe(process.stdout);
                for (let e of lists[i][list]) {
                    child.stdin.write(e + '\r\n');
                }
                child.stdin.end();
            });
        });

        fs.writeFile('/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json', empty, 'utf-8', err => {
            if (!err) console.log("Mailing list update executed successfully.");
            else console.error("Failed to write to mail.json: ", err);
        });
    } else console.error("Failed to read mail.json: ", err);
});