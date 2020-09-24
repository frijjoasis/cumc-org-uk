const router = require('express').Router();
const members = require('../../database/controllers/members');

router.get('/', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getMember(req.user.id).then(member => {
            res.json({
                member: member
            });
        });
    } else res.json(false);
});

router.get('/committee', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getCommitteeRole(req.user.id).then(role => {
            res.json(role);
        });
    } else res.json(false);
});

module.exports = router;