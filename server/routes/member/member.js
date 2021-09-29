const router = require('express').Router();
const members = require('../../database/controllers/members');
const logger = require('../../logger').logger;
const {userAuth, rootAuth} = require('../middleware');

router.get('/', userAuth, async function(req, res) {
    await members.getMember(req.user.id).then(member => {
        res.json({
            member: member
        });
    });
});

router.get('/committee', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getCommitteeRole(req.user.id).then(role => {
            res.json(role);
        });
    } else res.json(false);
});

router.get('/reset', rootAuth, async function(req, res) {
    await members.resetMembership().then(() => {
        res.json(true);
    }).catch(err => {
        logger.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

module.exports = router;