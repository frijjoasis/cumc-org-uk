const router = require('express').Router();
const members = require('../../database/controllers/members');

router.get('/past', function(req, res, next) {
    res.json({
        head: [],
        body: [],
    });
});

router.get('/current', async function(req, res) {
    if (req.isAuthenticated()) {
        await members.getCommitteeRole(req.user.id).then(role => {
            if (role) {
                return members.getCommittee().then(committee => {
                    res.json(committee);
                });
            } else res.json(false);
        });
    } else res.json(false);
});

module.exports = router;