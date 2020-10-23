const router = require('express').Router();
const users = require('../../database/controllers/users');
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
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.get('/info', userAuth, async function(req, res) {
    await users.getInfo(req.user.id).then(info => {
        res.json(info);
    });
});

router.post('/member', committeeAuth, async function(req, res) {
    await users.getMemberInfo(req.body.id).then(user => {
        res.json(user);
    }).catch(err => {
        console.error("Database err: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.get('/list', committeeAuth, async function(req, res) {
    await users.list().then(list => {
        res.json(list);
    });
});

module.exports = router;