const router = require('express').Router();
const members = require('../../database/controllers/members');
const {committeeAuth} = require('../middleware');

router.get('/past', function(req, res, next) {
    res.json({
        head: [],
        body: [],
    });
});

router.get('/current', committeeAuth, async function(req, res) {
    return members.getCommittee().then(committee => {
        res.json(committee);
    });
});

module.exports = router;