const router = require('express').Router();
const members = require('../../database/controllers/members');
const {userAuth} = require('../middleware');

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

module.exports = router;