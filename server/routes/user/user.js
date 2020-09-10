const router = require('express').Router();
const users = require('../../database/controllers/users')

router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        res.json({
            user: req.user
        });
    } else res.json(false);
});

router.post('/register', async function(req, res) {
    if (req.isAuthenticated()) {
        await users.upsertInfo(req.body, req.user.id).then(() => {
            res.json(true);
        }).catch(err => {
            console.error("Database error: ", err);
            res.json({err: "Database error: Please contact the webmaster"});
        });
    } else res.json({err: "You need to be signed in to do that!"});
});

router.get('/info', async function(req, res) {
    if (req.isAuthenticated()) {
        await users.getInfo(req.user.id).then(info => {
            res.json(info);
        });
    } else res.json(false);
});

module.exports = router;