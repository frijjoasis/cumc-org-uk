const router = require('express').Router();
const members = require('../../database/controllers/members');
const {userAuth, committeeAuth} = require('../middleware');

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

router.post('/info', committeeAuth, async function(req, res) {
    return members.getInfo(req.body.id).then(member => {
        res.json(member);
    });
});

router.get('/list', committeeAuth, async function(req, res) {
    return members.list().then(members => {
        res.json(members);
    });
});

module.exports = router;