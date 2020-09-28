const router = require('express').Router();
const users = require('../../database/controllers/users');
const {userAuth} = require('../middleware');

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

module.exports = router;