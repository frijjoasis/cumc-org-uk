const router = require('express').Router();
const meets = require('../../database/controllers/meets');
const users = require('../../database/controllers/users');
const signups = require('../../database/controllers/signups');

router.get('/upcoming', async function(req, res, next) {
    await meets.getAllUpcoming().then(upcoming => res.json(upcoming));
});

router.post('/view', async function(req, res) {
    await meets.getOneUpcoming(req.body.id).then(meet => {
        res.json(meet);
    }).catch(err => {
        console.error("Database error: ", err);
        res.json({err: "Database error: Please contact the webmaster"});
    });
});

router.post('/register', async function(req, res) {
    if (req.isAuthenticated()) {
        await users.isMissing(req.user.id).then(missing => {
            if (!missing) {
                return signups.handleRegister(req.body, req.user).then(() => {
                    res.json(true);
                }).catch(err => {
                    console.error("Database error: ", err);
                    res.json({err: "Database error: Please contact the webmaster"});
                });
            } else res.json({err: "You need to complete your profile to do that!"});
        });
    } else res.json({err: "You need to be signed in to do that!"});
});

module.exports = router;