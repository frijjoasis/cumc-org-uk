const router = require('express').Router();
const fs = require('fs');
const logger = require('../../logger').logger;
const {userAuth} = require('../middleware');

router.post('/update', userAuth, function(req, res) {
    fs.readFile('/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json', (err, data) => {
        if (!err) {
            let lists = JSON.parse(data.toString());

            const validLists = ["cumc-official", "cumc-oldgits", "cumc-freshers"];

            // This input will be fed to a shell, so we need sanitise it
            ["add", "remove"].forEach(i => {
                validLists.forEach(l => {
                    lists[i][l] = lists[i][l].filter(e => e !== req.user.email);
                    // Reset preferences

                    if (req.body[i].includes(l))
                        lists[i][l].push(req.user.email);
                    // Add them to relevant array

                });
            });
            lists = JSON.stringify(lists, null, 2);
            fs.writeFile('/societies/cumc/cumc-org-uk/server/routes/mailman/mail.json', lists, 'utf-8', err => {
                if (!err) {
                    logger.info("Successfully updated mail.json for " + req.user.email);
                    res.json(true);
                } else {
                    logger.error("Failed to write to mail.json: ", err);
                    res.json({err: "Something went wrong. Please contact the webmaster."});
                }
            });
        } else {
            logger.error("Failed to read mail.json: ", err);
            res.json({err: "Something went wrong. Please contact the webmaster."});
        }
    });
});

module.exports = router;