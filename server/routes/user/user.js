const router = require('express').Router();
const users = require('../../database/controllers/users');
const logger = require('../../logger').logger;
const {userAuth, committeeAuth} = require('../middleware');

router.get('/', userAuth, function(req, res) {
    res.json({
        user: req.user
    });
});

router.post('/register', userAuth, async function(req, res) {
    await users.upsertInfo(req.body, req.user.id).then(() => {
        res.json(true);
    }).catch(err => {
        logger.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.get('/info', userAuth, async function(req, res) {
    // Handle dev users - they don't exist in the database
    if (req.user.isDevUser) {
        return res.json({
            id: req.user.id,
            email: req.user.email,
            displayName: req.user.displayName,
            firstName: 'Dev',
            lastName: 'Admin',
            dob: '1990-01-01',
            phone: '07700000000',
            college: 'Dev College',
            address1: 'Dev Address',
            postCode: 'CB1 1AA',
            country: 'UK',
            emergencyName: 'Dev Emergency',
            emergencyPhone: '07700000000'
        });
    }

    await users.getInfo(req.user.id).then(info => {
        res.json(info);
    });
});

router.post('/member', committeeAuth, async function(req, res) {
    await users.getMemberInfo(req.body.id).then(user => {
        res.json(user);
    }).catch(err => {
        logger.error("Database err: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.get('/list', committeeAuth, async function(req, res) {
    await users.list().then(list => {
        res.json(list);
    });
});

module.exports = router;